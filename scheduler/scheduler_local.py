#!/usr/bin/env python3

import multiprocessing as mp
import subprocess as sp
import threading as th
import whiplash,time,json,os,argparse,daemon,sys,copy

def get_unresolved(db,pid,unresolved,is_work):
    t0 = time.time()

    work_batch = db.collection('work_batches').query({})
    if len(work_batch['properties']) == 0:
        is_work[0] = False
        unresolved = []
    else:
        is_work[0] = True
        model_indices = {}
        for i in range(len(work_batch['models'])):
            model_indices[work_batch['models'][i]['_id']] = i
        executable_indices = {}
        for i in range(len(work_batch['executables'])):
            executable_indices[work_batch['executables'][i]['_id']] = i
        for prop in work_batch['properties']:
            prop['model_index'] = model_indices[prop['input_model_id']]
            prop['executable_index'] = executable_indices[prop['executable_id']]
        unresolved.append(work_batch)

    t1 = time.time()
    print('worker',str(pid),'fetched',len(work_batch['properties']),'properties in time',t1-t0)

def commit_resolved(db,good_results,bad_results,pid):
    t0 = time.time()
    ids = db.models.commit(good_results['models'])
    t1 = time.time()
    elapsed0 = t1-t0
    print('worker',str(pid),'commited',len(good_results['models']),'models in time',elapsed0)
    for i in range(len(ids)):
        good_results['properties'][i]['output_model_id'] = ids[i]
    t0 = time.time()
    all_properties = good_results['properties']+bad_results['properties']
    db.properties.replace(all_properties)
    t1 = time.time()
    elapsed1 = t1-t0
    print('worker',str(pid),'commited',len(all_properties),'properties in time',elapsed1)

def resolve_object(pid,property,models,executables,work_dir):
    file_name = work_dir + '/object_' + str(pid) + '_' + str(property['_id']) + '.json'
    with open(file_name, 'w') as io_file:
        obj = models[property['model_index']]
        obj['params'] = property['params']
        io_file.write(json.dumps(obj).replace(" ",""))
    result = {}
    t0 = time.time()
    try:
        path = executables[property['executable_index']]['path']
        property['log'] = sp.check_output([path,file_name],timeout=property['timeout'],universal_newlines=True,stderr=sp.STDOUT)
        t1 = time.time()
        property['status'] = "resolved"
        with open(file_name, 'r') as io_file:
            result = json.load(io_file)
    except sp.TimeoutExpired as e:
        t1 = time.time()
        property['log'] = e.output + '\n' + 'Timed out after: ' + str(e.timeout) + ' seconds'
        property['status'] = "timed out"
    except sp.CalledProcessError as e:
        t1 = time.time()
        property['log'] = e.output + '\n' + 'Exit with code: ' + str(e.returncode)
        property['status'] = "errored"
    except FileNotFoundError as e:
        t1 = time.time()
        property['log'] = str(e)
        property['status'] = "not found"

    elapsed = t1-t0
    property['walltime'] = elapsed

    os.remove(file_name)

    if 'content' not in result: result['content'] = {}
    if 'None' in result['content']: result['content'] = {}
    result['property_id'] = property['_id']

    return {'property':property,'model':result}

def worker(pid,db,args,end_time):
    print('worker',str(pid),'active')

    start_time = time.time()

    unresolved0 = []
    unresolved1 = []
    fetch_thread = th.Thread()

    is_work = [db.collection('work_batches').count({}) > 0]

    threads = []
    while True:
        time_left = lambda: end_time - time.time()
        num_alive = lambda: sum(thread.is_alive() for thread in threads)
        if time_left() > 0:
            if (not fetch_thread.is_alive()) and (time_left() > args.time_window):
                unresolved1 = copy.deepcopy(unresolved0)
                unresolved0 = []
                if (time_left() > 2*args.time_window):
                    fetch_thread = th.Thread(target = get_unresolved, args = (db,pid,unresolved0,is_work,))
                    fetch_thread.start()
            if len(unresolved1) > 0:
                good_results = {'properties':[],'models':[]}
                bad_results = {'properties':[],'models':[]}
                t0 = time.time()
                for property in unresolved1[0]['properties']:
                    if time_left() > property['timeout']:
                        resolved = resolve_object(pid,property,unresolved1[0]['models'],unresolved1[0]['executables'],args.work_dir)
                        if resolved['property']['status'] == "resolved":
                            good_results['properties'].append(resolved['property'])
                            good_results['models'].append(resolved['model'])
                        else:
                            bad_results['properties'].append(resolved['property'])
                            bad_results['models'].append(resolved['model'])
                    else: break
                t1 = time.time()
                unresolved1 = [{'properties':[],'models':[],'executables':[]}]
                if (len(bad_results['properties']) + len(good_results['properties'])) > 0:
                    print('worker',str(pid),'resolved',len(good_results['properties']),'and fumbled',len(bad_results['properties']),'properties in time',t1-t0)
                    thread = th.Thread(target = commit_resolved, args = (db,good_results,bad_results,pid,))
                    thread.start()
                    threads.append(thread)
            elif not is_work[0]:
                if num_alive() == 0:
                    print('worker',str(pid),'has no live threads. no unresolved properties. shutting down')
                    sys.exit(0)
                else:
                    print('worker',str(pid),'no unresolved properties.',str(num_alive()),'threads alive.')
                time.sleep(1)
            elif time_left() < args.time_window:
                print('worker',str(pid),'is running out of time with',num_alive(),'threads still alive')
                time.sleep(1)
        else:
            break

def scheduler(args):
    start_time = time.time()
    end_time = time.time() + args.time_limit
    print('local scheduler started at',str(int(start_time)))

    db = whiplash.db(args.host,args.port,token=args.token)
    print('local scheduler connected to db')

    num_cpus = mp.cpu_count()
    if args.num_cpus != None:
        num_cpus = min(args.num_cpus,num_cpus)
    assert num_cpus > 0

    print('starting workers')
    context = mp.get_context('fork')
    procs = []
    for pid in range(num_cpus):
        p = context.Process(target=worker, args=(pid,db,args,end_time,))
        p.start()
        procs.append([pid,p])

    while True:
        is_work = (db.collection('work_batches').count({}) > 0)

        n_alive = 0
        for [pid,p] in procs:
            if p.is_alive():
                n_alive += 1
            elif (is_work) and ((end_time-time.time())>args.time_window):
                print('worker',str(pid),'restarting')
                p.join()
                p = context.Process(target=worker, args=(pid,db,args,end_time,))
                p.start()
                n_alive += 1

        if n_alive == 0:
            print('stopping workers')
            for [pid,p] in procs:
                p.join()
            sys.exit(0)

        time.sleep(1)

    print('local scheduler shutting down')

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=False,type=str,default="whiplash.ethz.ch")
    parser.add_argument('--port',dest='port',required=False,type=int,default=443)
    parser.add_argument('--token',dest='token',required=False,type=str)
    parser.add_argument('--time_limit',dest='time_limit',required=True,type=float)
    parser.add_argument('--time_window',dest='time_window',required=True,type=float)
    parser.add_argument('--work_dir',dest='work_dir',required=True,type=str)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int)
    parser.add_argument('--log_dir',dest='log_dir',required=False,type=str,default='/mnt/lnec/whiplash/logs/scheduler')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    args = parser.parse_args()

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_dir + '/local/' + str(int(time.time())) + '.log', 'w+')):
            scheduler(args)
    else:
        scheduler(args)
