#!/usr/bin/env python3

import multiprocessing as mp
import subprocess as sp
import threading as th
import whiplash,time,json,os,argparse,daemon,sys
import copy

def fetch_work_batch(db,time_limit,job_limit,pid):
    return db.properties.request("PUT","/api/properties/work_batch_atomic/",{'time_limit':time_limit,'job_limit':job_limit,'worker_id':pid})

def get_unresolved(db,time_limit,job_limit,pid,unresolved,is_work):

    t0 = time.time()

    properties = fetch_work_batch(db,time_limit,job_limit,pid)

    if len(properties) == 0:
        is_work[0] = False
        unresolved = []
    else:
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

        assert len(objs) > 0

        unresolved.append(objs)
        unresolved.append(models)
        unresolved.append(executables)

    t1 = time.time()
    print('worker',str(pid),'fetched',len(properties),'properties in time',t1-t0)    

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

    unresolved0 = []
    unresolved1 = []    
    fetch_thread = th.Thread()

    is_work = [True]

    threads = []
    while True:
        time_left = lambda: args.time_limit - (time.time()-t_start)
        num_alive = lambda: sum(thread.is_alive() for thread in threads)
        if time_left() > 0:
            if (not fetch_thread.is_alive()) and (time_left() > args.time_window):
                unresolved1 = copy.deepcopy(unresolved0)
                unresolved0 = []
                fetch_thread = th.Thread(target = get_unresolved, args = (wdb,args.time_window,args.job_limit,pid,unresolved0,is_work,))
                fetch_thread.start()
            if len(unresolved1) > 0:
                objs = unresolved1[0]
                models = unresolved1[1]
                executables = unresolved1[2]
                props,results = [],[]
                t0 = time.time()
                for obj in objs:
                    if time_left() > obj['property']['timeout']:
                        resolved = resolve_object(pid,obj,models,executables)
                        props.append(resolved[0])
                        results.append(resolved[1])
                    else: break
                t1 = time.time()
                unresolved1 = [[],[],[]]
                if len(props) > 0:
                    print('worker',str(pid),'resolved',len(props),'properties in time',t1-t0)
                    thread = th.Thread(target = commit_resolved, args = (wdb,props,results,pid,))
                    thread.start()
                    threads.append(thread)
            elif time_left() < args.time_window:
                print('worker',str(pid),'is running out of time with',num_alive(),'threads still alive')
            elif not is_work[0]:
                if num_alive() == 0:
                    print('worker',str(pid),'has no live threads, shutting down')
                    sys.exit(0)
                else:
                    print('no unresolved properties.',str(num_alive()),'threads alive on worker',str(pid))
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
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int)
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_local_' + str(int(time.time())) + '.log')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    parser.add_argument('--test',dest='test',required=False,default=False,action='store_true')
    parser.add_argument('--test_ip',dest='test_ip',required=False,type=str,default='192.168.99.100')
    parser.add_argument('--test_port',dest='test_port',required=False,type=int,default=7357)
    args = parser.parse_args()

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_file, 'w+')):
            scheduler(args)
    else:
        scheduler(args)
