#!/usr/bin/env python3

import sys, time, json, os, argparse, copy, logging
import multiprocessing as mp
import subprocess as sp
import threading as th
import whiplash

def time_left(end_time):
    return end_time - time.time()

def is_work(db, end_time):
    t0 = time.time()
    n_work_batches = db.collection('work_batches').count({'total_time':{"$lt": time_left(end_time)}})
    t1 = time.time()
    logging.info('counted %i work batches in %f seconds', n_work_batches, t1-t0)
    return n_work_batches > 0

def get_work_batch(args, db, pid, work_batches, end_time, pulled_containers=[]):
    logging.info('worker %i has begun trying to fetch a work batch', pid)
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
    t1 = time.time()
    if len(work_batch['properties']) > 0:
        work_batches.append(work_batch)
        logging.info('worker %i fetched a work batch with %i properties, %i models, and %i executables in %f seconds', pid, len(work_batch['properties']), len(work_batch['models']), len(work_batch['executables']), t1-t0)
    else:
        logging.info('worker %i found no work batches in %f seconds', pid, t1-t0)

def commit_resolved(db, pid, result):
    logging.info('worker %i has began committing back models and properties', pid)
    if len(result['good']['models']) > 0:
        t0 = time.time()
        ids = db.models.commit(result['good']['models'])
        t1 = time.time()
        logging.info('worker %i committed %i models in %f seconds', pid, len(result['good']['models']), t1-t0)
        for i in range(len(ids)):
            result['good']['properties'][i]['output_model_id'] = ids[i]
    t0 = time.time()
    all_properties = result['good']['properties']+result['bad']['properties']
    db.properties.replace(all_properties)
    t1 = time.time()
    elapsed1 = t1-t0
    logging.info('worker %i committed %i properties in %f seconds', pid, len(all_properties), t1-t0)

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
        with open(host_file_name, 'r') as io_file:
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

    #os.remove(host_file_name)

    if 'content' not in result: result['content'] = {}
    if 'None' in result['content']: result['content'] = {}
    result['property_id'] = property['_id']

    return {'property':property,'model':result}

def resolve_work_batch(args, pid, work_batch, end_time):
    good_results = {'properties':[],'models':[]}
    bad_results = {'properties':[],'models':[]}
    t0 = time.time()
    for property in work_batch['properties']:
        if time_left(end_time) > property['timeout']:
            resolved = resolve_object(args, pid, property, work_batch['models'], work_batch['executables'])
            if resolved['property']['status'] == "resolved":
                good_results['properties'].append(resolved['property'])
                good_results['models'].append(resolved['model'])
            else:
                bad_results['properties'].append(resolved['property'])
                bad_results['models'].append(resolved['model'])
        else:
            break
    t1 = time.time()
    logging.info('worker %i resolved %i and fumbled %i properties in %f seconds', pid, len(good_results['properties']), len(bad_results['properties']), t1-t0)
    return {'good':good_results, 'bad':bad_results}

def worker(pid, db, args, end_time):
    logging.info('worker %i active', pid)

    work_batches = []
    pulled_containers = []
    fetch_thread, commit_thread = th.Thread(), th.Thread()
    num_alive = lambda: fetch_thread.is_alive() + commit_thread.is_alive()
    while True:
        if (not fetch_thread.is_alive()) and (len(work_batches) < 2):
            fetch_thread = th.Thread(target = get_work_batch, args = (args,db,pid,work_batches,end_time,pulled_containers,))
            fetch_thread.start()
        if (len(work_batches) > 0):
            logging.info('worker %i has started resolving a work batch', pid)
            result = resolve_work_batch(args, pid, work_batches.pop(0), end_time)
            commit_thread = th.Thread(target = commit_resolved, args = (db,pid,result,))
            commit_thread.start()
        if (len(work_batches) == 0):
            if (not is_work(db, end_time)):
                time.sleep(5)
                if num_alive() == 0:
                    if (len(work_batches) == 0):
                        logging.info('worker %i has no live threads and no suitable work, shutting down', pid)
                        sys.exit(0)
                else:
                    logging.info('worker %i has no suitable work, but %i threads alive', pid, num_alive())

def scheduler(args):
    end_time = time.time() + args.time_limit
    logging.info('local scheduler started')

    db = whiplash.db(args.host,args.port,token=args.token)
    logging.info('local scheduler connected to db')

    num_cpus = mp.cpu_count()
    if args.num_cpus != None:
        num_cpus = min(args.num_cpus,num_cpus)
    assert num_cpus > 0

    logging.info('starting workers')
    context = mp.get_context('fork')
    procs = {}
    for pid in range(num_cpus):
        procs[pid] = context.Process(target=worker, args=(pid,db,args,end_time,))
        procs[pid].start()

    while True:
        time.sleep(5)
        n_alive = 0
        for pid in procs:
            if is_work(db, end_time) and (not procs[pid].is_alive()):
                logging.info('worker %i restarting', pid)
                procs[pid].join()
                procs[pid] = context.Process(target=worker, args=(pid,db,args,end_time,))
                procs[pid].start()
                n_alive += 1
            elif procs[pid].is_alive():
                n_alive += 1

        if n_alive == 0:
            logging.info('stopping workers')
            for pid in procs:
                procs[pid].join()
            sys.exit(0)

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
    parser.add_argument('--docker',dest='docker',required=False,default=False,action='store_true')
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_dir+'/local_'+args.user+'_'+str(int(time.time()))+'.log', level=logging.INFO, format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
    scheduler(args)
