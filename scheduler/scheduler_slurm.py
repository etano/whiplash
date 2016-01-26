#!/usr/bin/env python3

import whiplash,daemon,argparse,time,json,sys,os,random
import threading as th
import subprocess as sp

def seconds2time(time_limit):
    m, s = divmod(time_limit, 60)
    h, m = divmod(m, 60)
    return "%d:%02d:%02d" % (h, m, s)

def submit_job(args,time_limit,time_window):
    if not args.test:
        user_work_dir = '/mnt/lnec/' + args.user + '/.whiplash_run'
        sp.call("ssh " + args.user + "@" + args.cluster + " \"bash -lc \'" + "mkdir -p " + user_work_dir + "\'\"",shell=True)
        user_log_dir = user_work_dir + '/logs'
        sp.call("ssh " + args.user + "@" + args.cluster + " \"bash -lc \'" + "mkdir -p " + user_log_dir + "\'\"",shell=True)
        t = str(int(time.time()))
        job_name = "job_" + t
        job_file = "job_" + args.user + ".sbatch"
        user_job_file = ".whiplash_job.sbatch"
        print('submitting job:',args.user,' | ',time_limit,' | ',time_window)
        with open(job_file,"w") as sbatch:
            sbatch.write("#!/bin/bash -l" + "\n")
            sbatch.write("#SBATCH --job-name=" + "whiplash_" + t + "\n")
            sbatch.write("#SBATCH --output=" + user_log_dir + '/' + job_name + '.o' + "\n")
            sbatch.write("#SBATCH --error=" + user_log_dir + '/' + job_name + '.e' + "\n")
            sbatch.write("#SBATCH --partition=dphys_compute" + "\n")
            sbatch.write("#SBATCH --time=" + seconds2time(time_limit) + "\n")
            sbatch.write("#SBATCH --nodes=1" + "\n")
            sbatch.write("#SBATCH --exclusive" + "\n")
            sbatch.write("#SBATCH --ntasks=1" + "\n")
            sbatch.write("srun python " + args.whiplash_work_dir + "/rte/scheduler_local.py" + " --host " + args.host + " --port " + str(args.port) + " --token " + args.token + " --time_limit " + str(time_limit) + " --time_window " + str(time_window) + " --work_dir " + user_work_dir + " --num_cpus " + str(args.num_cpus) + "\n")

        sp.call("scp " + job_file + " " + args.user + "@" + args.cluster + ":" + user_job_file,shell=True)
        sp.call("ssh " + args.user + "@" + args.cluster + " \"bash -lc \'" + "source " + args.whiplash_work_dir + "/rte/user_init.sh && sbatch ~/" + user_job_file + "\'\"",shell=True)
    else:
        if args.docker:
            command = "./scheduler/scheduler_local_docker.py"
            work_dir =  os.environ['HOST_PATH']
        else:
            command = "./scheduler/scheduler_local.py"
            work_dir = os.getcwd()
        sp.call(command + " --host " + args.host + " --port " + str(args.port) + " --token " + args.token + " --time_limit " + str(time_limit) + " --time_window " + str(time_window) + " --work_dir " + work_dir + " --num_cpus " + str(args.num_cpus),shell=True)

def get_times(args,db):
    print('getting times')
    th = int(11.8*3600)
    timeouts = db.properties.stats("timeout",{"status":{"$in":["unresolved","pulled"]}})
    print(timeouts)
    if timeouts['count'] == 0 or timeouts['min'] > th:
        return [0,0]
    else:
        if args.local:
            th_min = 60
        else:
            th_min = 601
        time_window = min(th,max(1.2*timeouts['max'],th_min))
        time_limit = 24*3600
        return [time_limit,time_window]

def make_batches(db,time_window):
    print('querying properties')
    properties = db.properties.query({"status":"unresolved","timeout":{"$lt":time_window}},['_id','timeout','input_model_id','executable_id','owner'])

    print('building batches')
    batches = []
    times_left = []
    ids_in_batches = []
    for i in range(len(properties)):
        if len(batches)==1000:
            break
        found = False
        for j in range(len(batches)):
            if properties[i]['timeout'] < times_left[j]:
                times_left[j] -= properties[i]['timeout']
                batches[j]['property_ids'].append(properties[i]['_id'])
                batches[j]['model_ids'].append(properties[i]['input_model_id'])
                batches[j]['executable_ids'].append(properties[i]['executable_id'])
                found = True
                ids_in_batches.append(properties[i]['_id'])
                break
        if not found:
            batches.append({'property_ids':[properties[i]['_id']], 'model_ids':[properties[i]['input_model_id']], 'executable_ids':[properties[i]['executable_id']]})
            times_left.append(time_window - properties[i]['timeout'])
            ids_in_batches.append(properties[i]['_id'])

    for batch in batches:
        batch['model_ids'] = list(set(batch['model_ids']))
        batch['executable_ids'] = list(set(batch['executable_ids']))

    if len(batches) > 0:
        print('committing batches')
        db.properties.update({'_id': {'$in': ids_in_batches}},{'status':"pulled"})
        db.collection('work_batches').commit(batches)
        print('done')
    else:
        print('no suitable work')

def make_batches_local(args,db):
    while True:
        [time_limit,time_window] = get_times(args,db)
        if (time_limit > 0 and time_window > 0):
            make_batches(db,time_window)
        time.sleep(2)

def scheduler(args):

    db = whiplash.db(args.host,args.port,token=args.token)
    print('slurm scheduler connected to db')

    if args.local:
        batcher = th.Thread(target = make_batches_local, args = (args,db,))
        batcher.start()
        while True:
            [time_limit,time_window] = get_times(args,db)
            print('time_limit:',time_limit,'time_window:',time_window)
            if (time_limit > 0 and time_window > 0):
                #make_batches(db,time_window)
                print('starting local scheduler')
                if args.docker:
                    command = "./scheduler/scheduler_local_docker.py"
                    work_dir =  os.environ['HOST_PATH']
                else:
                    command = "./scheduler/scheduler_local.py"
                    work_dir = os.getcwd()
                sp.call(command + " --host " + args.host + " --port " + str(args.port) + " --token " + args.token + " --time_limit 86400 --time_window " + str(time_window) + " --work_dir " + work_dir + " --num_cpus " + str(args.num_cpus),shell=True)
            time.sleep(1)
    else:
        count = 0
        while True:
            if args.test and count > 1:
               break
            [time_limit,time_window] = get_times(args,db)
            if (time_limit > 0 and time_window > 0):
                make_batches(db,time_window)
            if not args.test:
                num_pending = int(sp.check_output("ssh " + args.user + "@" + args.cluster + " \'squeue -u " + args.user + " | grep \" PD \" | grep \"whiplash\" | wc -l\'", shell=True))
            else:
                num_pending = 0
            if (db.collection('work_batches').count({}) > 0) and (num_pending == 0):
                if (time_limit > 0 and time_window > 0):
                    submit_job(args,time_limit,time_window)
                else:
                    print('time_limit:',time_limit,'time_window:',time_window)
            time.sleep(1)
            count += 1

    print('slurm scheduler shutting down')

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=False,type=str,default="monchc300.cscs.ch") #"whiplash.ethz.ch"
    parser.add_argument('--port',dest='port',required=False,type=int,default=1337) #443
    parser.add_argument('--token',dest='token',required=False,type=str)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int,default=20)
    parser.add_argument('--user',dest='user',required=False,type=str,default='whiplash')
    parser.add_argument('--cluster',dest='cluster',required=False,type=str,default='monch.cscs.ch')
    parser.add_argument('--whiplash_work_dir',dest='whiplash_work_dir',required=False,type=str,default='/mnt/lnec/whiplash')
    parser.add_argument('--log_dir',dest='log_dir',required=False,type=str,default='/mnt/lnec/whiplash/logs/scheduler')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    parser.add_argument('--test',dest='test',required=False,default=False,action='store_true')
    parser.add_argument('--local',dest='local',required=False,default=False,action='store_true')
    parser.add_argument('--docker',dest='docker',required=False,default=False,action='store_true')    
    args = parser.parse_args()

    assert args.num_cpus <= 20

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_dir + '/slurm/' + args.user + '_' + str(int(time.time())) + '.log', 'w+')):
            scheduler(args)
    else:
        scheduler(args)
