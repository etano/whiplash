#!/usr/bin/env python3.4

#TODO: batch request for unresolved properties by scheduler from
#DB. when all properties in queue are resolved, scheduler empties the
#completed queue and requests new unresolved properties.

#TODO: request work according to how much the node can handle in the
#time limit of the scheduler. work_time = num_cpus *
#tasks_time. dispatch work according to time limits by adding the
#largest job which fits until no more space

#TODO: time limit on scheduler. close to time limit scheduler does not
#request any more from DB and cleans up completed queue.

#TODO: regular refresh of properties which never finished

#TODO: each interval scheduler commits completed work to DB

import multiprocessing as mp
import subprocess as sp
import whiplash,time,json,os,argparse,daemon,sys

def resolve_property(wdb,pid,unresolved):
    print('worker',str(pid),'active')
    while True:
        prop = unresolved.get()

        executable = wdb.executables.query_by_id(prop['executable_id'])
        model = wdb.models.query_by_id(prop['model_id'])

        print('worker',str(pid),'staring property:',prop['_id'])

        file_name = 'property_' + str(pid) + '_' + str(prop['_id']) + '.json'

        package = {'model':model,'params':prop['params']}
        with open(file_name, 'w') as propfile:
            json.dump(package, propfile)

        path = executable['path']
        timeout = prop['timeout']

        try:
            wdb.properties.update_status(prop['_id'],2)

            t0 = time.time()
            sp.call(path + [file_name],timeout=timeout)
            t1 = time.time()

            elapsed = t1-t0

            prop['walltime'] = elapsed

            with open(file_name, 'r') as propfile:
                prop['result'] = json.load(propfile)

            prop['status'] = 4

            print('worker',str(pid),'commiting property:',prop['_id'],'walltime:',elapsed)
            wdb.properties.commit_resolved(prop)

        except sp.TimeoutExpired:
            wdb.properties.update_status(prop['_id'],3)
            print('time expired for property',prop['_id'],'on worker',str(pid))

        os.remove(file_name)

def run(args):

    with open(args.wdb_info, 'r') as infile:
        wdb_info = json.load(infile)

    print('connecting to wdb')
    wdb = whiplash.wdb(wdb_info["host"],int(wdb_info["port"]),wdb_info["token"])

    num_cpus = mp.cpu_count()
    if args.num_cpus != None:
        num_cpus = min(args.num_cpus,num_cpus)
    assert num_cpus > 1

    context = mp.get_context('fork')
    unresolved = context.Queue()

    print('starting workers')
    for pid in range(num_cpus-1):
        p = context.Process(target=resolve_property, args=(wdb,pid,unresolved,))
        p.start()

    print('starting queries')
    while True:
        prop = wdb.properties.get_unresolved()
        if prop != {}:
            print('unresolved property:',prop['_id'])
            unresolved.put(prop)
        else:
            print('all properties are currently resolved')
            if args.exit_on_resolved: sys.exit(0)
        time.sleep(0.1)

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--wdb_info',dest='wdb_info',required=True,type=str)
    parser.add_argument('--time_limit',dest='time_limit',required=True,type=int)    
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int)
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_local_' + str(int(time.time())) + '.log')
    parser.add_argument('--exit_on_resolved',dest='exit_on_resolved',required=False,default=False,action='store_true')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    args = parser.parse_args()

    if args.daemonise:
        with daemon.DaemonContext(stdout=open(args.log_file, 'w+')):
            run(args)
    else:
        run(args)
