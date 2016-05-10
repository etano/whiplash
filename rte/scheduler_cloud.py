#!/usr/bin/env python3

import sys, os, logging, argparse, time, json, random
import whiplash
import subprocess as sp

def submit_job(args):
    logging.info('submitting job: %s', args.user)
    flags = " --host "+args.host+" --port "+str(args.port)+" --token "+args.token+" --time_limit "+str(args.time_limit)+" --work_dir "+args.work_dir+" --num_cpus "+str(args.num_cpus)+" --log_dir "+args.log_dir+" --user "+args.user+" --docker"
    n_running = sp.check_output("docker-machine ls | grep \"aws-rte\" | wc -l\'", shell=True)
    sp.call('docker-machine create --driver amazonec2 --amazonec2-security-group RTE --amazonec2-access-key AKIAILHRQR3JM3DER2RA --amazonec2-secret-key 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 --amazonec2-region eu-central-1 aws-rte-'+n_running, shell=True)
    sp.call('eval $(docker-machine env aws-rte) && docker run -d -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/bin/docker -v $PWD:/input -e "WORKDIR=$PWD" -p 1337:1337 whiplash/rte sh -c "./rte/scheduler_local.py '+flags+'"', shell=True)

def scheduler(args):
    db = whiplash.db(args.host,args.port,token=args.token)
    logging.info('cloud scheduler connected to db')

    while True:
        if (db.collection('work_batches').count({}) > 0):
            submit_job(args)
        time.sleep(5)

    logging.info('cloud scheduler shutting down')

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
    parser.add_argument('--work_dir',dest='work_dir',required=False,type=str,default='.')
    parser.add_argument('--verbose',dest='verbose',required=False,default=False,action='store_true')
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_dir+'/cloud_'+args.user+'_'+str(int(time.time()))+'.log', level=logging.INFO, format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
    if args.verbose:
        stderrLogger = logging.StreamHandler()
        stderrLogger.setFormatter(logging.Formatter(logging.BASIC_FORMAT))
        logging.getLogger().addHandler(stderrLogger)
    scheduler(args)
