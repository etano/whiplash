#!/usr/bin/env python3.4

import whiplash,daemon,argparse,time,json,sys,os,random
import subprocess as sp

def seconds2time(time_limit):
    m, s = divmod(time_limit, 60)
    h, m = divmod(m, 60)
    return "%d:%02d:%02d" % (h, m, s)

def submit_job(args,time_limit,time_window):
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

def get_times(wdb):
    print('getting times')
    timeouts = wdb.properties.stats("timeout",{"status":0})
    if timeouts['count'] == 0:
        return [0,0]
    else:
        return [min(24*3600,max(3600,1.5*min(timeouts['max'],max(timeouts['min'],random.normalvariate(timeouts['mean'],timeouts['stddev']))))),max(timeouts['min'],601)]

def make_batches(wdb,time_window):
    print('making batches')
    properties = wdb.properties.query_fields_only({"status":0,"timeout":{"$lt":time_window}},['_id','timeout'])
    ids = properties['_id']
    timeouts = properties['timeout']

    wdb.properties.update({'_id': {'$in': ids}},{'status':1})

    batches = []
    times_left = []
    for i in range(len(ids)):
        found = False
        for j in range(len(batches)):
            if timeouts[i] < times_left[j]:
                times_left[j] -= timeouts[i]
                batches[j]['ids'].append(ids[i])
                found = True
                break
        if not found:
            batches.append({'ids':[ids[i]]})
            times_left.append(time_window-timeouts[i])

    wdb.work_batches.commit(batches)

def scheduler(args):

    if args.test:
        wdb = whiplash.wdb(args.test_host,args.test_port,"","test","test","test","test")
    else:
        wdb = whiplash.wdb(args.host,args.port,args.token)

    print('scheduler connected to wdb')

    if not args.test:
        count = 0
        while True:
            if (count % 100 == 0) and (wdb.work_batches.count({}) == 0):
                [time_limit,time_window] = get_times(wdb)
                make_batches(wdb,time_window)
            num_pending = int(sp.check_output("ssh " + args.user + "@" + args.cluster + " \'squeue -u " + args.user + " | grep \" PD \" | wc -l\'", shell=True))
            if (wdb.work_batches.count({}) > 0) and (num_pending == 0):
                submit_job(args,time_limit,time_window)
            time.sleep(5)
            count += 1
    else:
        [time_limit,time_window] = get_times(wdb)
        make_batches(wdb,time_window)        

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
    parser.add_argument('--test_host',dest='test_host',required=False,type=str,default='192.168.99.100')
    parser.add_argument('--test_port',dest='test_port',required=False,type=int,default=7357)
    args = parser.parse_args()

    assert args.num_cpus <= 20

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_dir + '/slurm/' + args.user + '_' + str(int(time.time())) + '.log', 'w+')):
            scheduler(args)
    else:
        scheduler(args)
