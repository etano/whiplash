#!/usr/bin/env python3

import sys, time, json, os, argparse, copy, logging
import multiprocessing as mp
import subprocess as sp
import threading as th
import whiplash

def time_left(end_time):
    return end_time - time.time()

def is_work(db, end_time):
    return db.collection('work_batches').count({'total_time':{"$lt": time_left(end_time)}}) > 0

def get_unresolved(args, db, pid, unresolved, end_time, pulled_containers=[]):
    if is_work(db, end_time):
        t0 = time.time()
        work_batch = db.collection('work_batches').query({'total_time':{"$lt": time_left(end_time)}})
        model_indices = {}
        for i in range(len(work_batch['models'])):
            model_indices[work_batch['models'][i]['_id']] = i
        executable_indices = {}
        for i in range(len(work_batch['executables'])):
            if args.docker:
                container = work_batch['executables'][i]['path']
                if container not in pulled_containers:
                    pulled_containers.append(container)
                    sp.call("docker pull "+container, shell=True)
            else:
                executable_indices[work_batch['executables'][i]['_id']] = i
        for prop in work_batch['properties']:
            prop['model_index'] = model_indices[prop['input_model_id']]
            prop['executable_index'] = executable_indices[prop['executable_id']]
        unresolved.append(work_batch)
        t1 = time.time()
        logging.info('worker %i fetched %i properties in %f seconds', pid, len(work_batch['properties']), t1-t0)
    else:
        unresolved = []

def commit_resolved(db, good_results, bad_results, pid):
    t0 = time.time()
    ids = db.models.commit(good_results['models'])
    t1 = time.time()
    logging.info('worker %i commited %i models in %f seconds', pid, len(good_results['models']), t1-t0)
    for i in range(len(ids)):
        good_results['properties'][i]['output_model_id'] = ids[i]
    t0 = time.time()
    all_properties = good_results['properties']+bad_results['properties']
    db.properties.replace(all_properties)
    t1 = time.time()
    elapsed1 = t1-t0
    logging.info('worker %i commited %i properties in %f seconds', pid, len(all_properties), t1-t0)

def resolve_object(args, pid, property, models, executables):
    file_name = 'object_'+str(pid)+'_'+str(property['_id'])+'.json'
    host_file_name = args.work_dir+'/'+file_name
    with open(host_file_name, 'w') as io_file:
        obj = models[property['model_index']]
        obj['params'] = property['params']
        io_file.write(json.dumps(obj).replace(" ",""))
    result = {}
    t0 = time.time()
    try:
        path = executables[property['executable_index']]['path']
        if args.docker:
            command = 'docker run --rm=true -i -v ' + args.work_dir + ':/input ' + path + ' /input/' + file_name
        else:
            command = path+' '+host_file_name
        property['log'] = sp.check_output(command,timeout=property['timeout'],universal_newlines=True,stderr=sp.STDOUT,shell=True)
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

    os.remove(host_file_name)

    if 'content' not in result: result['content'] = {}
    if 'None' in result['content']: result['content'] = {}
    result['property_id'] = property['_id']

    return {'property':property,'model':result}

def worker(pid, db, args, end_time):
    start_time = time.time()
    logging.info('worker %i active', pid)

    unresolved0, unresolved1 = [], []
    pull_containers = []
    fetch_thread = th.Thread(target = get_unresolved, args = (args,db,pid,unresolved0,end_time,pulled_containers,))
    fetch_thread.start()

    threads = [fetch_thread]
    num_alive = lambda: sum(thread.is_alive() for thread in threads)
    while True:
        if (not fetch_thread.is_alive()):
            unresolved1 = copy.deepcopy(unresolved0)
            unresolved0 = []
            fetch_thread = th.Thread(target = get_unresolved, args = (args,db,pid,unresolved0,end_time,pulled_containers,))
            fetch_thread.start()
        if len(unresolved1) > 0:
            good_results = {'properties':[],'models':[]}
            bad_results = {'properties':[],'models':[]}
            t0 = time.time()
            for property in unresolved1[0]['properties']:
                if time_left(end_time) > property['timeout']:
                    resolved = resolve_object(args, pid, property, unresolved1[0]['models'], unresolved1[0]['executables'])
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
                logging.info('worker %i resolved %i and fumbled %i properties in %f seconds', pid, len(good_results['properties']), len(bad_results['properties']), t1-t0)
                commit_thread = th.Thread(target = commit_resolved, args = (db,good_results,bad_results,pid,))
                commit_thread.start()
                threads.append(commit_thread)
        elif num_alive() == 0:
            if len(unresolved0) == 0:
                logging.info('worker %i has no live threads and no suitable work, shutting down', pid)
                sys.exit(0)
        elif len(unresolved0) == 0:
            logging.info('worker %i has no suitable work, but %i threads alive', pid, num_alive())
            time.sleep(2)

def scheduler(args):
    start_time = time.time()
    end_time = time.time() + args.time_limit
    logging.info('local scheduler started at %f', start_time)

    db = whiplash.db(args.host,args.port,token=args.token)
    logging.info('local scheduler connected to db')

    num_cpus = mp.cpu_count()
    if args.num_cpus != None:
        num_cpus = min(args.num_cpus,num_cpus)
    assert num_cpus > 0

    logging.info('starting workers')
    context = mp.get_context('fork')
    procs = []
    for pid in range(num_cpus):
        p = context.Process(target=worker, args=(pid,db,args,end_time,))
        p.start()
        procs.append([pid,p])

    while True:
        n_alive = 0
        for [pid,p] in procs:
            if p.is_alive():
                n_alive += 1
            elif is_work(db, end_time):
                logging.info('worker %i restarting', pid)
                p.join()
                p = context.Process(target=worker, args=(pid,db,args,end_time,))
                p.start()
                n_alive += 1
        if n_alive == 0:
            logging.info('stopping workers')
            for [pid,p] in procs:
                p.join()
            sys.exit(0)
        time.sleep(2)

    logging.info('local scheduler shutting down')

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=True,type=str)
    parser.add_argument('--port',dest='port',required=True,type=int)
    parser.add_argument('--user',dest='user',required=True,type=str)
    parser.add_argument('--token',dest='token',required=True,type=str)
    parser.add_argument('--time_limit',dest='time_limit',required=True,type=float)
    parser.add_argument('--work_dir',dest='work_dir',required=True,type=str)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int,default=1)
    parser.add_argument('--log_dir',dest='log_dir',required=False,type=str,default='.')
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_dir+'/'+args.user+'_local_'+str(int(time.time()))+'.log', level=logging.INFO, format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
    scheduler(args)
