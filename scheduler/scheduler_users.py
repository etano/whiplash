#!/usr/bin/env python3

import daemon,argparse,time,sys,os,whiplash
import subprocess as sp
import multiprocessing as mp

def start_scheduler_slurm(args,wdb_user):
    if args.test:
        sp.call("./scheduler/scheduler_slurm.py --test " + "--user " + wdb_user['username'] + " --token " + wdb_user['token'] + " --host " + args.host + " --port " + str(args.port) + " --num_cpus 1",shell=True)
    elif args.local:
        sp.call("./scheduler/scheduler_slurm.py --local " + "--user " + wdb_user['username'] + " --token " + wdb_user['token'] + " --host " + args.host + " --port " + str(args.port) + " --num_cpus " + str(args.num_cpus),shell=True)
    else:
        sp.call("./scheduler/scheduler_slurm.py --daemonise " + "--user " + wdb_user['username'] + " --token " + wdb_user['token'] + " --cluster " + wdb_user['cluster'],shell=True)

def get_users(users,accesstokens):
    all_users = users.query({})
    all_tokens = accesstokens.query({})
    tokens_arr = []
    for token in all_tokens:
        tokens_arr.append(token)
    wdb_users = []
    for user in all_users:
        if user['username'] != "scheduler":
            for token in tokens_arr:
                if (str(user['_id']) == token['userId']) and (token['clientId'] == user['username']+'-scheduler'):
                    cluster = "monch.cscs.ch" #TODO: dedicated collection of clusters
                    wdb_users.append({'username':user['username'],'token':token['token'],'cluster':cluster})
                    break
    return wdb_users

def scheduler(args):
    wdb = whiplash.wdb(args.host,args.port,username="scheduler",password="c93lbcp0hc[5209sebf10{3ca")
    print('user scheduler connected to wdb')
    context = mp.get_context('fork')

    users = wdb.collection(wdb,'users')
    accesstokens = wdb.collection(wdb,'accesstokens')

    running_users = []
    schedulers = []
    count = 0
    while True:
        for wdb_user in get_users(users,accesstokens):
            user = wdb_user['username']
            if user not in running_users:
                if (not args.test) and (not args.local) and (sp.call("ssh -o BatchMode=yes " + user + "@" + wdb_user['cluster'] + " \'ls\'",stdout=sp.DEVNULL,stderr=sp.STDOUT,shell=True) == 255):
                    print('access denied for user',user)
                else:
                    print('starting slurm scheduler for user',user)
                    p = context.Process(target=start_scheduler_slurm, args=(args,wdb_user,))
                    p.start()
                    schedulers.append(p)
                    running_users.append(user)
        if args.test:
            break
        else:
            time.sleep(10)
            count += 1
    print('user scheduler shutting down')
    for p in schedulers:
        p.join()
    sys.exit(0)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=False,type=str,default="monchc300.cscs.ch") #"whiplash.ethz.ch"
    parser.add_argument('--port',dest='port',required=False,type=int,default=1337) #443
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int,default=20)
    parser.add_argument('--log_dir',dest='log_dir',required=False,type=str,default='/mnt/lnec/whiplash/logs/scheduler')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    parser.add_argument('--test',dest='test',required=False,default=False,action='store_true')
    parser.add_argument('--local',dest='local',required=False,default=False,action='store_true')
    args = parser.parse_args()
    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_dir + '/users/' + str(int(time.time())) + '.log', 'w+')):
            scheduler(args)
    else:
        scheduler(args)
