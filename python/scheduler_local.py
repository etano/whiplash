#!/usr/bin/env python3

import multiprocessing as mp
import subprocess as sp
import threading as th
import whiplash,time,json,os,argparse,daemon,sys,copy

def get_unresolved(wdb,time_limit,pid,unresolved,is_work):

    t0 = time.time()

    property_ids = wdb.work_batches.request("GET","/api/work_batches/",{})
    properties = wdb.properties.query({'_id': {'$in': property_ids}})

    if len(properties) == 0:
        is_work[0] = False
        unresolved = []
    else:
        model_ids = set()
        executable_ids = set()
        for prop in properties:
            model_ids.add(prop['input_model_id'])
            executable_ids.add(prop['executable_id'])
        models = wdb.models.query({'_id': { '$in': list(model_ids) }})
        executables = wdb.executables.query({'_id': { '$in': list(executable_ids) }})

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

def commit_resolved(wdb,good_results,bad_results,pid):
    t0 = time.time()
    ids = wdb.models.commit(good_results['models'])['ids']
    t1 = time.time()
    elapsed0 = t1-t0
    print('worker',str(pid),'commited',len(good_results['models']),'models in time',elapsed0)
    for ID in ids:
        good_results['properties'][ID['index']]['output_model_id'] = ID['_id']
    t0 = time.time()
    all_properties = good_results['properties']+bad_results['properties']
    wdb.properties.batch_update(all_properties)
    t1 = time.time()
    elapsed1 = t1-t0
    print('worker',str(pid),'commited',len(all_properties),'properties in time',elapsed1)

def resolve_object(pid,obj,models,executables,work_dir):
    prop = obj['property']
    ID = prop['_id']

    package = json.dumps({'content':models[obj['model_index']]['content'],'params':prop['params']}).replace(" ","")

    file_name = work_dir + '/object_' + str(pid) + '_' + str(ID) + '.json'

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

    return {'property':prop,'model':result}

def worker(pid,wdb,args,end_time):
    print('worker',str(pid),'active')

    start_time = time.time()

    unresolved0 = []
    unresolved1 = []
    fetch_thread = th.Thread()

    is_work = [wdb.work_batches.count({}) > 0]

    threads = []
    while True:
        time_left = lambda: end_time - time.time()
        num_alive = lambda: sum(thread.is_alive() for thread in threads)
        if time_left() > 0:
            if (not fetch_thread.is_alive()) and (time_left() > args.time_window):
                unresolved1 = copy.deepcopy(unresolved0)
                unresolved0 = []
                if (time_left() > 2*args.time_window):
                    fetch_thread = th.Thread(target = get_unresolved, args = (wdb,args.time_window,pid,unresolved0,is_work,))
                    fetch_thread.start()
            if len(unresolved1) > 0:
                objs = unresolved1[0]
                models = unresolved1[1]
                executables = unresolved1[2]
                good_results = {'properties':[],'models':[]}
                bad_results = {'properties':[],'models':[]}
                t0 = time.time()
                for obj in objs:
                    if time_left() > obj['property']['timeout']:
                        resolved = resolve_object(pid,obj,models,executables,args.work_dir)
                        if resolved['property']['status'] == 3:
                            good_results['properties'].append(resolved['property'])
                            good_results['models'].append(resolved['model'])
                        else:
                            bad_results['properties'].append(resolved['property'])
                            bad_results['models'].append(resolved['model'])
                    else: break
                t1 = time.time()
                unresolved1 = [[],[],[]]
                if (len(bad_results['properties']) + len(good_results['properties'])) > 0:
                    print('worker',str(pid),'resolved',len(good_results['properties']),'and fumbled',len(bad_results['properties']),'properties in time',t1-t0)
                    thread = th.Thread(target = commit_resolved, args = (wdb,good_results,bad_results,pid,))
                    thread.start()
                    threads.append(thread)
            elif time_left() < args.time_window:
                print('worker',str(pid),'is running out of time with',num_alive(),'threads still alive')
                time.sleep(2)
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
    start_time = time.time()
    end_time = time.time() + args.time_limit
    print('scheduler started at',str(int(start_time)))

    if args.test:
        wdb = whiplash.wdb(args.test_host,args.test_port,"","test","test","test","test")
    else:
        wdb = whiplash.wdb(args.host,args.port,args.token)
    print('scheduler connected to wdb')

    num_cpus = mp.cpu_count()
    if args.num_cpus != None:
        num_cpus = min(args.num_cpus,num_cpus)
    assert num_cpus > 0

    print('starting workers')
    context = mp.get_context('fork')
    procs = []
    for pid in range(num_cpus):
        p = context.Process(target=worker, args=(pid,wdb,args,end_time,))
        p.start()
        procs.append([pid,p])

    while True:
        is_work = wdb.work_batches.count({})

        n_alive = 0
        for [pid,p] in procs:
            if p.is_alive():
                n_alive += 1
            elif (is_work) and ((end_time-time.time())>args.time_window):
                print('worker',str(pid),'restarting')
                p.join()
                p = context.Process(target=worker, args=(pid,wdb,args,end_time,))
                p.start()
                n_alive += 1

        if n_alive == 0:
            print('stopping workers')
            for [pid,p] in procs:
                p.join()
            sys.exit(0)

        time.sleep(2)

    print('shutting down')

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=False,type=str,default="whiplash.ethz.ch")
    parser.add_argument('--port',dest='port',required=False,type=int,default=443)
    parser.add_argument('--token',dest='token',required=False,type=str)
    parser.add_argument('--time_limit',dest='time_limit',required=True,type=float)
    parser.add_argument('--time_window',dest='time_window',required=True,type=float)
    parser.add_argument('--work_dir',dest='work_dir',required=True,type=str)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int)
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_local_' + str(int(time.time())) + '.log')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    parser.add_argument('--test',dest='test',required=False,default=False,action='store_true')
    parser.add_argument('--test_host',dest='test_host',required=False,type=str,default='192.168.99.100')
    parser.add_argument('--test_port',dest='test_port',required=False,type=int,default=7357)
    args = parser.parse_args()

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_file, 'w+')):
            scheduler(args)
    else:
        scheduler(args)
