#!/usr/bin/env python3

import whiplash,daemon,argparse,time,json,sys,os
import subprocess as sp



if __name__ == '__main__':

    parser = argparse.ArgumentParser()


    args = parser.parse_args()

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_file, 'w+')):
            scheduler(args)
    else:
        scheduler(args)
