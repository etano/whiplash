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
    all_users = db.collection('users').query({})
    all_tokens = db.collection('accesstokens').query({})
    db_users = []
    for user in all_users:
        if user['username'] != "scheduler":
            for token in all_tokens:
                if (str(user['_id']) == token['userId']) and (token['clientId'] == user['username']+'-scheduler'):
                    if args.cluster:
                        cluster = "monch.cscs.ch" #TODO: dedicated collection of clusters
                        work_dir = '/mnt/lnec/'+user['username']+'/.whiplash_run'
                    else:
                        cluster = ''
                        work_dir = '.'
                    db_users.append({'username':user['username'],'token':token['token'],'cluster':cluster,'work_dir':work_dir})
                    break
    return db_users

def check_access(db_user):
    command = "ssh -o BatchMode=yes "+db_user['username']+"@"+db_user['cluster']+" \'ls\'"
    logging.info(command)
    logging.info(sp.call(command,stdout=sp.DEVNULL,stderr=sp.STDOUT,shell=True))
    return (not (sp.call(command,stdout=sp.DEVNULL,stderr=sp.STDOUT,shell=True) == 255))

def scheduler(args):
    db = whiplash.db(args.host,args.port,username="scheduler",password="c93lbcp0hc[5209sebf10{3ca",save_token=True)
    logging.info('user scheduler connected to db')

    time_limit = 24*3600
    running_users = []
    schedulers = []
    while True:
        all_users = get_users(args, db)
        if len(all_users) > 0:
            for db_user in get_users(args, db):
                username = db_user['username']
                if username not in running_users:
                    flags = " --user "+db_user['username']+" --token "+db_user['token']+" --host "+args.host+" --port "+str(args.port)+" --log_dir "+args.log_dir
                    logging.info('starting batcher for user %s', db_user['username'])
                    p = th.Thread(target=start_batcher, args=(args,flags,))
                    p.start()
                    schedulers.append(p)
                    flags += " --num_cpus "+str(args.num_cpus)+" --work_dir "+db_user['work_dir']+" --time_limit "+str(time_limit)
                    if args.docker:
                        flags += " --docker"
                    if args.cluster:
                        if check_access(db_user):
                            flags += " --cluster "+db_user['cluster']
                            logging.info('starting slurm scheduler for user %s', db_user['username'])
                            p = th.Thread(target=start_slurm_scheduler, args=(args,flags,))
                            p.start()
                            schedulers.append(p)
                        else:
                            logging.info('access denied for user %s', username)
                    else:
                        logging.info('starting local scheduler for user %s', db_user['username'])
                        p = th.Thread(target=start_local_scheduler, args=(args,flags,))
                        p.start()
                        schedulers.append(p)
                    running_users.append(username)
            if args.test:
                break
        else:
            logging.info('no users found')
        time.sleep(5)
    logging.info('terminating user schedulers')
    for p in schedulers:
        p.join()
    logging.info('user scheduler exiting')
    sys.exit(0)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=True,type=str)
    parser.add_argument('--port',dest='port',required=True,type=int)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int,default=1)
    parser.add_argument('--log_dir',dest='log_dir',required=False,type=str,default='.')
    parser.add_argument('--rte_dir',dest='rte_dir',required=False,type=str,default=os.path.dirname(os.path.realpath(sys.argv[0])))
    parser.add_argument('--test',dest='test',required=False,default=False,action='store_true')
    parser.add_argument('--local',dest='local',required=False,default=False,action='store_true')
    parser.add_argument('--docker',dest='docker',required=False,default=False,action='store_true')
    parser.add_argument('--cluster',dest='cluster',required=False,default=False,action='store_true')
    parser.add_argument('--verbose',dest='verbose',required=False,type=bool,default=False)
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_dir+'/manager_'+str(int(time.time()))+'.log', level=logging.INFO, format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
    if args.verbose:
        stderrLogger = logging.StreamHandler()
        stderrLogger.setFormatter(logging.Formatter(logging.BASIC_FORMAT))
        logging.getLogger().addHandler(stderrLogger)
    scheduler(args)
