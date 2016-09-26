#!/usr/bin/env python3

import sys, os, logging, argparse, time
import subprocess as sp
import threading as th
import whiplash

def start_batcher(args, flags):
    if args.test:
        flags += " --test"
    command = args.rte_dir+"/batcher.py"+flags
    sp.call(command, shell=True)

def start_slurm_scheduler(args, flags):
    command = args.rte_dir+"/scheduler_slurm.py"+flags
    sp.call(command, shell=True)

def start_local_scheduler(args, flags):
    command = args.rte_dir+"/scheduler_local.py"+flags
    sp.call(command, shell=True)

def get_users(args, db):
    try:
        all_users = db.collection('users').query({})
        all_tokens = db.collection('accesstokens').query({})
        db_users = []
        for user in all_users:
            if user['username'] != "scheduler":
                for token in all_tokens:
                    if (str(user['_id']) == token['owner']) and (token['client_id'] == user['username']+'-scheduler'):
                        db_user = {'username':user['username'], 'token':token['token']}
                        if args.cluster:
                            db_user['cluster'] = "monch.cscs.ch" #TODO: dedicated collection of clusters
                            db_user['work_dir'] = '/mnt/lnec/'+user['username']+'/.whiplash_run'
                        elif args.dind:
                            db_user['work_dir'] = os.environ['WHIPLASH_LAUNCH_WORK_DIR']
                        else:
                            db_user['work_dir'] = os.environ['WHIPLASH_HOST_WORK_DIR']
                        if (db_user['username'] != 'admin'):
                            db_users.append(db_user)
                        break
        return db_users
    except:
        logging.error("Error in finding users")
        return []

def check_access(db_user):
    try:
        command = "ssh -o BatchMode=yes "+db_user['username']+"@"+db_user['cluster']+" \'ls\'"
        result = sp.call(command,stdout=sp.DEVNULL,stderr=sp.STDOUT,shell=True)
        return (not (result == 255))
    except:
        logging.error("Error in checking access for %s"%(db_user))
        return 0

def scheduler(args):
    db = whiplash.db(args.host,args.port,username="admin",password=os.environ['WHIPLASH_ADMIN_PASSWORD'],save_token=True)
    logging.info('admin connected to db')

    time_limit = 24*3600
    schedulers = {}
    while True:
        all_users = get_users(args, db)
        if len(all_users) > 0:
            for db_user in get_users(args, db):
                username = db_user['username']
                if username not in schedulers:
                    schedulers[username] = {'batcher': th.Thread()}
                    if args.cluster:
                        schedulers[username]['slurm'] = th.Thread()
                    else:
                        schedulers[username]['local'] = th.Thread()

                flags = " --user "+username+" --token "+db_user['token']+" --host "+args.host+" --port "+str(args.port)+" --log_dir "+args.log_dir
                if (args.verbose):
                    flags += " --verbose"

                if not schedulers[username]['batcher'].is_alive():
                    logging.info('starting batcher for user %s', username)
                    schedulers[username]['batcher'] = th.Thread(target=start_batcher, args=(args,flags,))
                    schedulers[username]['batcher'].start()

                flags += " --num_cpus "+str(args.num_cpus)+" --work_dir "+db_user['work_dir']+" --time_limit "+str(time_limit)
                if args.docker:
                    flags += " --docker"
                if args.dind:
                    flags += " --dind"

                if args.cluster:
                    if not schedulers[username]['slurm'].is_alive():
                        if check_access(db_user):
                            flags += " --cluster "+db_user['cluster']
                            logging.info('starting slurm scheduler for user %s', username)
                            schedulers[username]['slurm'] = th.Thread(target=start_slurm_scheduler, args=(args,flags,))
                            schedulers[username]['slurm'].start()
                        else:
                            logging.info('access denied for user %s', username)
                else:
                    if not schedulers[username]['local'].is_alive():
                        logging.info('starting local scheduler for user %s', username)
                        schedulers[username]['local'] = th.Thread(target=start_local_scheduler, args=(args,flags,))
                        schedulers[username]['local'].start()
            if args.test:
                break
        else:
            logging.info('no users found')
        time.sleep(5)
    logging.info('terminating user schedulers')
    for username in schedulers:
        schedulers[username]['batcher'].join()
        if args.cluster:
            schedulers[username]['slurm'].join()
        else:
            schedulers[username]['local'].join()
    logging.info('user scheduler exiting')
    sys.exit(0)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=False,type=str,default=os.environ['WHIPLASH_API_HOST'])
    parser.add_argument('--port',dest='port',required=False,type=int,default=os.environ['WHIPLASH_API_PORT'])
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int,default=1)
    parser.add_argument('--log_dir',dest='log_dir',required=False,type=str,default='.')
    parser.add_argument('--rte_dir',dest='rte_dir',required=False,type=str,default=os.path.dirname(os.path.realpath(sys.argv[0])))
    parser.add_argument('--test',dest='test',required=False,default=False,action='store_true')
    parser.add_argument('--docker',dest='docker',required=False,default=False,action='store_true')
    parser.add_argument('--dind',dest='dind',required=False,default=False,action='store_true')
    parser.add_argument('--local',dest='local',required=False,default=False,action='store_true')
    parser.add_argument('--cluster',dest='cluster',required=False,default=False,action='store_true')
    parser.add_argument('--verbose',dest='verbose',required=False,default=False,action='store_true')
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_dir+'/manager_'+str(int(time.time()))+'.log', level=logging.INFO, format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
    if args.verbose:
        stderrLogger = logging.StreamHandler()
        stderrLogger.setFormatter(logging.Formatter(logging.BASIC_FORMAT))
        logging.getLogger().addHandler(stderrLogger)
    scheduler(args)
