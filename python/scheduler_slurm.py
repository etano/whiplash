#!/usr/bin/env python3

import whiplash,daemon,argparse,time,json,sys,os
import subprocess as sp

def put_job_tag(wdb,time_limit,job_limit):
    return wdb.properties.request("PUT","/api/properties/job_tag/",{'time_limit':time_limit,'job_limit':job_limit})

def submit_job(args,job_tag):
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
        sbatch.write("#SBATCH --time=" + str(args.time_limit) + ":00:00" + "\n")
        sbatch.write("#SBATCH --nodes=1" + "\n")
        sbatch.write("#SBATCH --exclusive" + "\n")
        sbatch.write("#SBATCH --ntasks=1" + "\n")
        sbatch.write("srun python scheduler_local.py --wdb_info " + args.wdb_info + " --time_limit " + str(args.time_limit) + " --job_limit " + str(args.job_limit) + " --time_window " + str(args.time_window) + " --num_cpus " + str(args.num_cpus) + " --job_tag " + job_tag + "\n")
    sp.call("scp " + "run.sbatch" + " " + args.cluster + ":rte/",shell=True)
    sp.call("ssh " + args.cluster + " \"bash -lc \'" + "cd rte && sbatch run.sbatch" + "\'\"",shell=True)

def run(args):

    with open(args.wdb_info, 'r') as infile:
        wdb_info = json.load(infile)

    print('connecting to wdb')
    wdb = whiplash.wdb(wdb_info["host"],wdb_info["port"],wdb_info["token"])

    sp.call("ssh " + args.cluster + " \"bash -lc \'" + "mkdir -p rte && mkdir -p rte/log" + "\'\"",shell=True)
    for FILE in ["whiplash.py","scheduler_local.py",args.wdb_info]:
        sp.call("scp " + FILE + " " + args.cluster + ":rte/",shell=True)

    while True:
        job_tag = put_job_tag(wdb,args.time_limit,args.job_limit)
        if job_tag != '':
            submit_job(args,job_tag)
        time.sleep(5)

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--wdb_info',dest='wdb_info',required=True,type=str)
    parser.add_argument('--time_limit',dest='time_limit',required=True,type=int)
    parser.add_argument('--job_limit',dest='job_limit',required=False,type=int,default=1000)
    parser.add_argument('--time_window',dest='time_window',required=True,type=int)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int,default=20)
    parser.add_argument('--cluster',dest='cluster',required=True,type=str)
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_slurm_' + str(int(time.time())) + '.log')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    args = parser.parse_args()

    assert args.num_cpus <= 20

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_file, 'w+')):
            run(args)
    else:
        run(args)
