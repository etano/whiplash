#!/usr/bin/env python3.4

import multiprocessing as mp
import subprocess as sp
import whiplash,time,json,os,argparse,daemon,sys

def resolve_object(obj):
    prop = obj['property']
    ID = prop['_id']

    print('worker',str(pid),'staring property',ID)

    file_name = 'property_' + str(pid) + '_' + str(ID) + '.json'

    with open(file_name, 'w') as propfile:
        json.dump({'model':obj['model'],'params':prop['params']}, propfile)

    path = obj['executable']['path']
    timeout = prop['timeout']

    try:
        t0 = time.time()
        sp.call(path + [file_name],timeout=timeout)
        t1 = time.time()

        elapsed = t1-t0

        prop['walltime'] = elapsed

        with open(file_name, 'r') as propfile:
            prop['result'] = json.load(propfile)

        prop['status'] = 4
        print('worker',str(pid),'resolved property',ID,'with walltime',elapsed)
    except sp.TimeoutExpired:
        prop['status'] = 3
        print('time expired for property',prop['_id'],'on worker',str(pid))

    os.remove(file_name)
    return prop

def worker(pid,args):
    print('worker',str(pid),'active')

    t_start = time.time()

    with open(args.wdb_info, 'r') as infile:
        wdb_info = json.load(infile)

    wdb = whiplash.wdb(wdb_info["host"],int(wdb_info["port"]),wdb_info["token"])
    print('worker',str(pid),'connected to wdb')

    while True:
        time_left = args.time_limit - (time.time()-t_start)
        work_time = int(time_left*float(args.alpha)/100)
        if work_time > 0:
            unresolved = wdb.properties.get_unresolved_batch(work_time)
            if len(unresolved) > 0:
                resolved = []
                for obj in unresolved:
                    resolved.append(resolve_object(obj))
                wdb.properties.commit_resolved_batch(resolved)
            else:
                print('all properties are currently resolved')
            time.sleep(1)
        else:
            break
            
def run(args):

    num_cpus = mp.cpu_count()
    if args.num_cpus != None:
        num_cpus = min(args.num_cpus,num_cpus)
    assert num_cpus > 1

    print('starting workers')
    context = mp.get_context('fork')
    for pid in range(num_cpus-1):
        context.Process(target=worker, args=(pid,args,)).start()
        time.sleep(5)

    while True: pass

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--wdb_info',dest='wdb_info',required=True,type=str)
    parser.add_argument('--time_limit',dest='time_limit',required=True,type=int)
    parser.add_argument('--alpha',dest='alpha',required=True,type=int)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int)
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_local_' + str(int(time.time())) + '.log')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    args = parser.parse_args()

    if args.daemonise:
        with daemon.DaemonContext(stdout=open(args.log_file, 'w+')):
            run(args)
    else:
        run(args)
