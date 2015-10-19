#!/usr/bin/env python

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

        command = executable['path']
        timeout = prop['timeout']

        try:
            wdb.properties.update_status(prop['_id'],2)

            t0 = time.time()
            sp.call(command.split(' ')+[file_name],timeout=timeout)
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

if __name__ == '__main__':

    num_cpus = mp.cpu_count()
    assert num_cpus > 0
    if num_cpus < 2:
        print('get a bigger machine')
        sys.exit(0)

    parser = argparse.ArgumentParser()
    parser.add_argument('--dbhost',dest='dbhost',required=True,type=str)
    parser.add_argument('--port',dest='port',required=True,type=str)
    parser.add_argument('--token',dest='token',required=True,type=str)
    args = parser.parse_args()

    with daemon.DaemonContext(stdout=open('scheduler_' + str(int(time.time())) + '.log', 'w+')):
        wdb = whiplash.wdb(args.dbhost,args.port,args.token)

        context = mp.get_context('fork')
        unresolved = context.Queue()

        print('starting workers')
        for pid in range(num_cpus-1):
            p = context.Process(target=resolve_property, args=(wdb,pid,unresolved,))
            p.start()

        print('starting queries')
        while True:
            prop = wdb.properties.get_unresolved()
            wdb.properties.update_status(prop['_id'],1)
            if prop != {}:
                print('unresolved property:',prop['_id'])
                unresolved.put(prop)
            else:
                print('all properties are currently resolved')
            time.sleep(0.1)
