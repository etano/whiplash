#!/usr/bin/env python3

import whiplash,daemon,argparse,time,json,sys,os
import subprocess as sp

def run(args):

    with open(args.wdb_info, 'r') as infile:
        wdb_info = json.load(infile)

    print('connecting to wdb')
    wdb = whiplash.wdb(wdb_info["host"],wdb_info["port"],wdb_info["token"])

    job_number = 0

    while True:
        num_unresolved = wdb.properties.get_num_unresolved()
        num_pending = int(sp.check_output("ssh " + args.cluster + " \'squeue -u whiplash | grep \"PD\" | wc -l\'", shell=True))
        print('unresolved:',num_unresolved,' | ','pending:',num_pending)
        if num_unresolved > 0 and num_pending == 0:
            print('submitting job')
            sp.call("ssh " + args.cluster + " \"bash -lc \'cd /users/whiplash/whiplash/whiplash/python && sh run.sh " + args.wdb_info + " " + str(job_number) + " " + str(args.time_limit) + " " + str(args.job_limit) + " " + str(args.num_cpus) + " " + str(args.time_window) + "\'\"",shell=True)
            job_number += 1
        time.sleep(5)
    
if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--wdb_info',dest='wdb_info',required=True,type=str)
    parser.add_argument('--time_limit',dest='time_limit',required=True,type=int)
    parser.add_argument('--job_limit',dest='job_limit',required=False,type=int,default=1000)
    parser.add_argument('--time_window',dest='time_window',required=True,type=int)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int)
    parser.add_argument('--cluster',dest='cluster',required=True,type=str)
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_slurm_' + str(int(time.time())) + '.log')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    args = parser.parse_args()

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_file, 'w+')):
            run(args)
    else:
        run(args)
