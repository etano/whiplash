#!/usr/bin/env python3

import sys, os, logging, argparse, time, json, random
import whiplash
import subprocess as sp

def seconds2time(t):
    m, s = divmod(t, 60)
    h, m = divmod(m, 60)
    return "%d:%02d:%02d" % (h, m, s)

def submit_job(args):
    try:
        user_work_dir = '/mnt/lnec/' + args.user + '/.whiplash_run'
        sp.call("ssh " + args.user + "@" + args.cluster + " \"bash -lc \'" + "mkdir -p " + user_work_dir + "\'\"",shell=True,timeout=5)
        user_log_dir = user_work_dir + '/logs'
        sp.call("ssh " + args.user + "@" + args.cluster + " \"bash -lc \'" + "mkdir -p " + user_log_dir + "\'\"",shell=True,timeout=5)
        t = str(int(time.time()))
        job_name = "job_" + t
        job_file = "job_" + args.user + ".sbatch"
        user_job_file = ".whiplash_job.sbatch"
        logging.info('submitting job: %s | %i', args.user, args.time_limit)
        flags = " --host "+args.host+" --port "+str(args.port)+" --token "+args.token+" --time_limit "+str(args.time_limit)+" --work_dir "+user_work_dir+" --num_cpus "+str(args.num_cpus)+" --log_dir "+args.log_dir
        if args.docker:
            flags += " --docker"
        with open(job_file,"w") as sbatch:
            sbatch.write("#!/bin/bash -l" + "\n")
            sbatch.write("#SBATCH --job-name=" + "whiplash_" + t + "\n")
            sbatch.write("#SBATCH --output=" + user_log_dir + '/' + job_name + '.o' + "\n")
            sbatch.write("#SBATCH --error=" + user_log_dir + '/' + job_name + '.e' + "\n")
            sbatch.write("#SBATCH --partition=dphys_compute" + "\n")
            sbatch.write("#SBATCH --time=" + seconds2time(args.time_limit) + "\n")
            sbatch.write("#SBATCH --nodes=1\n")
            sbatch.write("#SBATCH --exclusive\n")
            sbatch.write("#SBATCH --ntasks=1\n")
            sbatch.write("module load python/3.4.1-gcc-4.8.1\n")
            sbatch.write("export PYTHONPATH=/mnt/lnec/whiplash/rte/python_packages:/mnt/lnec/whiplash/rte:$PYTHONPATH\n")
            sbatch.write("srun python /mnt/lnec/whiplash/rte/scheduler_local.py"+flags+"\n")
        sp.call("scp " + job_file + " " + args.user + "@" + args.cluster + ":" + user_job_file,shell=True,timeout=5)
        sp.call("ssh " + args.user + "@" + args.cluster + " \"bash -lc \'" + "sbatch ~/" + user_job_file + "\'\"",shell=True,timeout=5)
    except sp.TimeoutExpired as e:
        logging.error('ERROR: Timed out in %i second(s) with %s'%(timeout, e.cmd))

def scheduler(args):
    db = whiplash.db(args.host,args.port,token=args.token)
    logging.info('slurm scheduler connected to db')

    while True:
        num_pending = int(sp.check_output("ssh " + args.user + "@" + args.cluster + " \'squeue -u " + args.user + " | grep \" PD \" | grep \"whiplash\" | wc -l\'", shell=True))
        if (db.collection('work_batches').count({}) > 0) and (num_pending == 0):
            submit_job(args)
        time.sleep(1)

    logging.info('slurm scheduler shutting down')

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=True,type=str)
    parser.add_argument('--port',dest='port',required=True,type=int)
    parser.add_argument('--token',dest='token',required=True,type=str)
    parser.add_argument('--user',dest='user',required=True,type=str)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int,default=1)
    parser.add_argument('--log_dir',dest='log_dir',required=False,type=str,default='.')
    parser.add_argument('--docker',dest='docker',required=False,default=False,action='store_true')
    parser.add_argument('--time_limit',dest='time_limit',required=True,type=float)
    parser.add_argument('--cluster',dest='cluster',required=True,type=str,default='')
    parser.add_argument('--work_dir',dest='work_dir',required=False,type=str,default='.')
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_dir+'/'+args.user+'_slurm_'+str(int(time.time()))+'.log', level=logging.INFO, format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
    scheduler(args)
