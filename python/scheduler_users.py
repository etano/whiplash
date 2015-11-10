#!/usr/bin/env python3

import whiplash,daemon,argparse,time,sys,os,json
import subprocess as sp
import threading as th

def start_scheduler_slurm(wdb_user):
    sp.call("./scheduler_slurm.py" + " --user " + wdb_user['username'] + " --token " + wdb_user['token'] + " --cluster " + wdb_user['cluster'],shell=True)

def get_request(wdb,uri):
    status, reason, res = wdb.request("GET",uri,json.dumps({}))
    if status == 200:
        return json.loads(res.decode('utf-8'))["result"]
    else:
        return []
        print(status,reason,res)
    
def get_users(wdb):
    users = get_request(wdb,"/api/users/")
    tokens = get_request(wdb,"/api/users/tokens")
    wdb_users = []
    for user in users:
        for token in tokens:
            if user['_id'] == token['userId']:
                cluster = "monch.cscs.ch" #TODO: dedicated collection of clusters
                wdb_users.append({'username':user['username'],'token':token['token'],'cluster':cluster})
                break
    return wdb_users

def scheduler(args):

    wdb = whiplash.wdb(args.host,args.port,args.token)

    print('scheduler connected to wdb')

    users = []
    while True:

        for wdb_user in get_users(wdb):
            user = wdb_user['username']
            if user not in users:
                print('starting slurm scheduler for user',user)
                th.Thread(target = start_scheduler_slurm, args = (wdb_user,)).start()
                users.append(user)

        time.sleep(60)

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=False,type=str,default="whiplash.ethz.ch")
    parser.add_argument('--port',dest='port',required=False,type=int,default=443)
    parser.add_argument('--token',dest='token',required=True,type=str)
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_users_' + str(int(time.time())) + '.log')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    args = parser.parse_args()

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_file, 'w+')):
            scheduler(args)
    else:
        scheduler(args)
