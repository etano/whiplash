#!/usr/bin/env python3

import multiprocessing as mp
import subprocess as sp
import threading as th
import whiplash,time,json,os,argparse,daemon,sys

def fetch_work_batch(db,time_limit,job_limit,pid):
    return db.properties.request("PUT","/api/properties/work_batch_atomic/",{'time_limit':time_limit,'job_limit':job_limit,'worker_id':pid})

def get_unresolved(db,time_limit,job_limit,pid):
    properties = fetch_work_batch(db,time_limit,job_limit,pid)

    model_ids = set()
    executable_ids = set()
    for prop in properties:
        model_ids.add(prop['input_model_id'])
        executable_ids.add(prop['executable_id'])
    models = db.models.query({'_id': { '$in': list(model_ids) }})
    executables = db.executables.query({'_id': { '$in': list(executable_ids) }})

    objs = []
    for prop in properties:
        obj = {'property':prop,'model_index':-1,'executable_index':-1}
        for i in range(len(models)):
            if prop['input_model_id'] == models[i]['_id']:
                obj['model_index'] = i
                break
        for i in range(len(executables)):
            if prop['executable_id'] == executables[i]['_id']:
                obj['executable_index'] = i
                break
        objs.append(obj)

    return [objs,models,executables]

def commit_resolved(db,props,results,pid):
    t0 = time.time()
    ids = db.models.commit(results)['ids']
    t1 = time.time()
    elapsed0 = t1-t0
    for ID in ids:
        props[ID['index']]['output_model_id'] = ID['_id']
    t0 = time.time()
    db.properties.batch_update(props)
    t1 = time.time()
    elapsed1 = t1-t0
    print('worker',str(pid),'commited',len(props),'properties in times',elapsed0,'and',elapsed1)

def resolve_object(pid,obj,models,executables):
    prop = obj['property']
    ID = prop['_id']

    #print('worker',str(pid),'computing property',ID)

    package = json.dumps({'content':models[obj['model_index']]['content'],'params':prop['params']}).replace(" ","")

    file_name = 'property_' + str(pid) + '_' + str(ID) + '.json'

    with open(file_name, 'w') as propfile:
        propfile.write(package)

    path = executables[obj['executable_index']]['path']
    timeout = prop['timeout']

    t0 = time.time()

    try:
        prop['log'] = sp.check_output([path,file_name],timeout=timeout,universal_newlines=True,stderr=sp.STDOUT)
        prop['status'] = 3
        with open(file_name, 'r') as propfile:
            result = json.load(propfile)
    except sp.TimeoutExpired as e:
        prop['log'] = e.output + '\n' + 'Timed out after: ' + str(e.timeout) + ' seconds'
        prop['status'] = 2
        result = {}
    except sp.CalledProcessError as e:
        prop['log'] = e.output + '\n' + 'Exit with code: ' + str(e.returncode)
        prop['status'] = 4
        result = {}

    t1 = time.time()

    elapsed = t1-t0

    prop['walltime'] = elapsed

    os.remove(file_name)

    if 'content' not in result: result['content'] = {}
    if 'None' in result['content']: result['content'] = {}
    if 'tags' not in result: result['tags'] = {}
    if 'None' in result['tags']: result['tags'] = {}
    result['tags']['property_id'] = ID

    #print('worker',str(pid),'resolved property',ID,'with status',prop['status'],'and walltime',elapsed)
    return [prop,result]

def worker(pid,wdb,args):
    print('worker',str(pid),'active')

    t_start = time.time()

    threads = []
    while True:
        time_left = lambda: args.time_limit - (time.time()-t_start)
        if time_left() > 0:
            t0 = time.time()
            unresolved = get_unresolved(wdb,min(time_left(),args.time_window),args.job_limit,pid)
            t1 = time.time()
            objs = unresolved[0]
            models = unresolved[1]
            executables = unresolved[2]
            if len(objs) > 0:
                print('worker',str(pid),'fetched',len(objs),'properties in time',t1-t0,'with',time_left(),'seconds of work left')
                props,results = [],[]
                t0 = time.time()
                for obj in objs:
                    if time_left() > obj['property']['timeout']:
                        resolved = resolve_object(pid,obj,models,executables)
                        props.append(resolved[0])
                        results.append(resolved[1])
                    else: break
                t1 = time.time()
                print('worker',str(pid),'resolved',len(props),'properties in time',t1-t0)
                thread = th.Thread(target = commit_resolved, args = (wdb,props,results,pid, ))
                thread.start()
                threads.append(thread)
            else:
                # Get alive threads
                threads = [thread for thread in threads if thread.is_alive()]
                n_alive = len(threads)
                if len(threads) == 0:
                    print('worker',str(pid),'has no threads still alive, shutting down')
                    sys.exit(0)
                else:
                    print('worker',str(pid),'found no unresolved properties currently, but has',str(n_alive),'threads alive')
                time.sleep(2)
        else:
            break

def scheduler(args):

    if args.test:
        wdb = whiplash.wdb(args.test_ip,args.test_port,"","test","test","test","test")
    else:
        with open(args.wdb_info, 'r') as infile:
            wdb_info = json.load(infile)
        wdb = whiplash.wdb(wdb_info["host"],wdb_info["port"],wdb_info["token"])
    print('scheduler connected to wdb')

    num_cpus = mp.cpu_count()
    if args.num_cpus != None:
        num_cpus = min(args.num_cpus,num_cpus)
    assert num_cpus > 0

    print('starting workers')
    context = mp.get_context('fork')
    procs = []
    for pid in range(num_cpus):
        p = context.Process(target=worker, args=(pid,wdb,args,))
        p.start()
        procs.append([pid,p])

    while True:
        # Check if there are unresolved properties
        num_unresolved = wdb.properties.get_num_unresolved()

        # Loop through workers, checking if they are alive
        n_alive = 0
        for [pid,p] in procs:
            if p.is_alive():
                n_alive += 1
            else:
                # If worker has stopped, but there is work, start it again
                if num_unresolved > 0:
                    print('restarting worker',str(pid))
                    p.join()
                    p = context.Process(target=worker, args=(pid,wdb,args,))
                    p.start()
                    n_alive += 1

        # If no workers are alive, join them and kill myself
        if n_alive == 0:
            print('stopping workers')
            for [pid,p] in procs:
                p.join()
            sys.exit(0)

        # Sleep
        time.sleep(2)

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--wdb_info',dest='wdb_info',required=False,type=str)
    parser.add_argument('--time_limit',dest='time_limit',required=True,type=float)
    parser.add_argument('--job_limit',dest='job_limit',required=False,type=int,default=1000)
    parser.add_argument('--time_window',dest='time_window',required=True,type=float)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int,default=1)
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_local_' + str(int(time.time())) + '.log')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    parser.add_argument('--test',dest='test',required=False,default=False,action='store_true')
    parser.add_argument('--test_ip',dest='test_ip',required=False,type=str,default='192.168.99.100')
    parser.add_argument('--test_port',dest='test_port',required=False,type=int,default=7357)
    args = parser.parse_args()

    assert args.num_cpus <= 20

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_file, 'w+')):
            scheduler(args)
    else:
        scheduler(args)
