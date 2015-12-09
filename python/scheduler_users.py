#!/usr/bin/env python3

import daemon,argparse,time,sys,os,whiplash
import subprocess as sp
import multiprocessing as mp

def start_scheduler_slurm(args,wdb_user):
    if not args.test:
        sp.call("./python/scheduler_slurm.py" + " --user " + wdb_user['username'] + " --token " + wdb_user['token'] + " --cluster " + wdb_user['cluster'],shell=True)
    else:
        sp.call("./python/scheduler_slurm.py --test " + " --user " + wdb_user['username'] + " --token " + wdb_user['token'] + " --host " + args.host + " --port " + str(args.port),shell=True)

def get_users(wdb):
    users = wdb.users.query({})
    tokens = wdb.accesstokens.query({})

    tokens_arr = []
    for token in tokens:
        tokens_arr.append(token)

    wdb_users = []
    for user in users:
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

    users = []
    schedulers = []
    count = 0
    while True:
        if args.test:
            if count > 1:
                break
            else:
                count += 1
        for wdb_user in get_users(wdb):
            user = wdb_user['username']
            if user not in users:
                print('starting slurm scheduler for user',user)
                p = context.Process(target=start_scheduler_slurm, args=(args,wdb_user,))
                p.start()
                schedulers.append(p)
                users.append(user)
        time.sleep(60)

    print('user scheduler shutting down')
    for p in schedulers:
        p.join()
    sys.exit(0)

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=False,type=str,default="monchc300.cscs.ch") #"whiplash.ethz.ch"
    parser.add_argument('--port',dest='port',required=False,type=int,default=1337) #443
    parser.add_argument('--log_dir',dest='log_dir',required=False,type=str,default='/mnt/lnec/whiplash/logs/scheduler')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    parser.add_argument('--test',dest='test',required=False,default=False,action='store_true')
    args = parser.parse_args()

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_dir + '/users/' + str(int(time.time())) + '.log', 'w+')):
            scheduler(args)
    else:
        scheduler(args)
