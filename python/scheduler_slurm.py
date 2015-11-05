#!/usr/bin/env python3

import whiplash,daemon,argparse,time,json,sys,os,random
import subprocess as sp

def seconds2time(time_limit):
    m, s = divmod(time_limit, 60)
    h, m = divmod(m, 60)
    return "%d:%02d:%02d" % (h, m, s)

def submit_job(args,time_limit,job_tag):
    print('submitting job')
    job_name = "whiplash_job_" + str(job_tag)
    log_dir = "log/" + job_name
    sp.call("ssh " + args.cluster + " \"bash -lc \'" + "mkdir -p rte/" + log_dir + "\'\"",shell=True)
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
        sbatch.write("srun python scheduler_local.py --wdb_info " + args.wdb_info + " --time_limit " + str(time_limit) + " --job_limit " + str(args.job_limit) + " --time_window " + str(args.time_window) + " --num_cpus " + str(args.num_cpus) + "\n")
    sp.call("scp " + "run.sbatch" + " " + args.cluster + ":rte/",shell=True)
    sp.call("ssh " + args.cluster + " \"bash -lc \'" + "cd rte && sbatch run.sbatch" + "\'\"",shell=True)

def get_time_limit(wdb):
    timeouts = wdb.properties.stats("timeout",{"status":0})
    if timeouts['count'] == 0:
        return 0
    else:
        return min(24*3600,max(3600,random.normalvariate(timeouts['mean'],timeouts['stddev'])))

def scheduler(args):

    with open(args.wdb_info, 'r') as infile:
        wdb_info = json.load(infile)

    print('connecting to wdb')
    wdb = whiplash.wdb(wdb_info["host"],wdb_info["port"],wdb_info["token"])

    sp.call("ssh " + args.cluster + " \"bash -lc \'" + "mkdir -p rte && mkdir -p rte/log" + "\'\"",shell=True)
    for FILE in ["whiplash.py","scheduler_local.py",args.wdb_info]:
        sp.call("scp " + FILE + " " + args.cluster + ":rte/",shell=True)

    count = 0
    while True:
        if count % 100 == 0:
            time_limit = get_time_limit(wdb)
        num_pending = int(sp.check_output("ssh " + args.cluster + " \'squeue -u whiplash | grep \"PD\" | wc -l\'", shell=True))
        if (time_limit > 0) and (num_pending < args.max_in_queue):
            submit_job(args,time_limit,count)
            count += 1
        time.sleep(1)

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--wdb_info',dest='wdb_info',required=True,type=str)
    parser.add_argument('--job_limit',dest='job_limit',required=False,type=int,default=1000)
    parser.add_argument('--time_window',dest='time_window',required=True,type=float)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int,default=20)
    parser.add_argument('--cluster',dest='cluster',required=True,type=str)
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_slurm_' + str(int(time.time())) + '.log')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    parser.add_argument('--max_in_queue',dest='daemonise',required=False,type=int,default=1)
    args = parser.parse_args()

    assert args.num_cpus <= 20
    assert args.time_window < 3600

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_file, 'w+')):
            scheduler(args)
    else:
        scheduler(args)
