#!/usr/bin/env python3

import whiplash,daemon,argparse,time,json,sys,os,random
import subprocess as sp

def seconds2time(time_limit):
    m, s = divmod(time_limit, 60)
    h, m = divmod(m, 60)
    return "%d:%02d:%02d" % (h, m, s)

def submit_job(args,time_limit,time_window,job_tag):
    print('submitting job:',job_tag,' | ',time_limit,' | ',time_window)
    job_name = args.user + "_" + str(job_tag)
    log_dir = "log/" + job_name
    sp.call("ssh " + args.user + "@" + args.cluster + " \"bash -lc \'" + "mkdir -p " + args.work_dir + "/" + log_dir + "\'\"",shell=True)
    with open("run.sbatch","w") as sbatch:
        sbatch.write("#!/bin/bash -l" + "\n")
        sbatch.write("#SBATCH --job-name=" + job_name + "\n")
        sbatch.write("#SBATCH --output=" + log_dir + "/out.o" + "\n")
        sbatch.write("#SBATCH --error=" + log_dir + "/out.e" + "\n")
        sbatch.write("#SBATCH --partition=dphys_compute" + "\n")
        sbatch.write("#SBATCH --time=" + seconds2time(time_limit) + "\n")
        sbatch.write("#SBATCH --nodes=1" + "\n")
        sbatch.write("#SBATCH --exclusive" + "\n")
        sbatch.write("#SBATCH --ntasks=1" + "\n")
        sbatch.write("srun python /users/whiplash/rte/scheduler_local.py" + " --host " + args.host + "--port " + str(args.port) + "--token " + args.token + " --time_limit " + str(time_limit) + " --time_window " + str(time_window) + " --work_dir " + args.work_dir + " --num_cpus " + str(args.num_cpus) + "\n")
    sp.call("scp " + "run.sbatch" + " " + args.user + "@" + args.cluster + ":" + args.work_dir + "/",shell=True)
    sp.call("ssh " + args.user + "@" + args.cluster + " \"bash -lc \'" + "cd " + args.work_dir + " && source /users/whiplash/init_monch.sh && sbatch run.sbatch" + "\'\"",shell=True)
    sp.call("ssh " + args.user + "@" + args.cluster + " \"bash -lc \'" + "rm " + args.work_dir + "/" + "run.sbatch" + "\'\"",shell=True)

def get_times(wdb):
    timeouts = wdb.properties.stats("timeout",{"status":0})
    if timeouts['count'] == 0:
        return [0,0]
    else:
        return [min(24*3600,max(3600,1.5*min(timeouts['max'],max(timeouts['min'],random.normalvariate(timeouts['mean'],timeouts['stddev']))))),max(timeouts['min'],600)]

def make_batches(wdb,time_window):

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
            times_left.append(time_window)

    wdb.work_batches.commit(batches)

def scheduler(args):

    if args.test:
        wdb = whiplash.wdb(args.test_host,args.test_port,"","test","test","test","test")
    else:
        wdb = whiplash.wdb(args.host,args.port,args.token)

    print('scheduler connected to wdb')

    if not args.test:
        sp.call("ssh " + args.user + "@" + args.cluster + " \"bash -lc \'" + "mkdir -p " + args.work_dir + " && mkdir -p " + args.work_dir + "/log" + "\'\"",shell=True)
        count = 0
        while True:
            if count % 100 == 0:
                [time_limit,time_window] = get_times(wdb)
                make_batches(wdb,time_window)
            num_pending = int(sp.check_output("ssh " + args.user + "@" + args.cluster + " \'squeue -u " + args.user + " | grep \" PD \" | wc -l\'", shell=True))
            if (wdb.work_batches.count({}) > 0) and (num_pending == 0):
                job_tag = str(int(time.time()))
                submit_job(args,time_limit,time_window,job_tag)
            time.sleep(5)
            count += 1

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=False,type=str,default="whiplash.ethz.ch")
    parser.add_argument('--port',dest='port',required=False,type=int,default=443)
    parser.add_argument('--token',dest='token',required=False,type=str)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int,default=20)
    parser.add_argument('--user',dest='user',required=False,type=str,default='whiplash')
    parser.add_argument('--cluster',dest='cluster',required=False,type=str,default='monch.cscs.ch')
    parser.add_argument('--work_dir',dest='work_dir',required=False,type=str,default='/mnt/lnec/whiplash/run')
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_slurm_' + str(int(time.time())) + '.log')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    parser.add_argument('--test',dest='test',required=False,default=False,action='store_true')
    parser.add_argument('--test_host',dest='test_host',required=False,type=str,default='192.168.99.100')
    parser.add_argument('--test_port',dest='test_port',required=False,type=int,default=7357)
    args = parser.parse_args()

    assert args.num_cpus <= 20

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_file, 'w+')):
            scheduler(args)
    else:
        scheduler(args)
