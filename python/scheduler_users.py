#!/usr/bin/env python3

import daemon,argparse,time,sys,os,json,pymongo
import subprocess as sp
import multiprocessing as mp

def start_scheduler_slurm(wdb_user):
    sp.call("./scheduler_slurm.py" + " --user " + wdb_user['username'] + " --token " + wdb_user['token'] + " --cluster " + wdb_user['cluster'],shell=True)

def get_users(wdb):
    users = wdb.users.find({})
    tokens = wdb.accesstokens.find({})
    wdb_users = []
    for user in users:
        for token in tokens:
            if str(user['_id']) == token['userId']:
                cluster = "monch.cscs.ch" #TODO: dedicated collection of clusters
                wdb_users.append({'username':user['username'],'token':token['token'],'cluster':cluster})
                break
    return wdb_users

def scheduler(args):

    client = pymongo.MongoClient(args.host,27017)
    client.wdb.authenticate('scheduler','c93lbcp0hc[5209sebf10{3ja',mechanism='SCRAM-SHA-1')

    print('scheduler connected to wdb')

    context = mp.get_context('fork')

    users = []
    while True:
        for wdb_user in get_users(client.wdb):
            user = wdb_user['username']
            if user not in users:
                print('starting slurm scheduler for user',user)
                context.Process(target=start_scheduler_slurm, args=(wdb_user,)).start()
                users.append(user)
        time.sleep(60)

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=False,type=str,default="monchc300.cscs.ch") #whiplash.ethz.ch
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_users_' + str(int(time.time())) + '.log')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    args = parser.parse_args()

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_file, 'w+')):
            scheduler(args)
    else:
        scheduler(args)
