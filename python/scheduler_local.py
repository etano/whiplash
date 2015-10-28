#!/usr/bin/env python3.4

import multiprocessing as mp
import subprocess as sp
import whiplash,time,json,os,argparse,daemon,sys

def fetch_work_batch(db,time_limit):
    status, reason, res = db.request("PUT","/api/properties/work_batch/",json.dumps({'time_limit':time_limit}))
    return json.loads(res.decode('utf-8'))["objs"]

def get_unresolved(db,time_limit,batch=True):
    if batch:
        properties = fetch_work_batch(db,time_limit)
    else:
        properties = [db.properties.find_one_and_update({'status':0},{'status':1})]

    model_ids = set()
    executable_ids = set()
    for prop in properties:
        model_ids.add(prop['model_id'])
        executable_ids.add(prop['executable_id'])
    models = db.models.query({'_id': { '$in': list(model_ids) }})
    executables = db.executables.query({'_id': { '$in': list(executable_ids) }})

    objs = []
    for prop in properties:
        obj = {'property':prop,'model_index':-1,'executable_index':-1}
        for i in range(len(models)):
            if prop['model_id'] == models[i]['_id']:
                obj['model_index'] = i
                break
        for i in range(len(executables)):
            if prop['executable_id'] == executables[i]['_id']:
                obj['executable_index'] = i
                break
        objs.append(obj)

    return [objs,models,executables]

def commit_resolved(db,props,batch=True):
    if batch:
        IDs = []
        for prop in props:
            IDs.append(prop["_id"])
        db.properties.delete({'_id': { '$in': IDs }})
        db.properties.commit(props)
    else:
        for prop in props:
            db.properties.update_id(prop["_id"],prop)

def resolve_object(pid,obj,models,executables):
    prop = obj['property']
    ID = prop['_id']

    print('worker',str(pid),'computing property',ID)

    package = json.dumps({'model':models[obj['model_index']]['content'],'params':prop['params']})
    path = executables[obj['executable_index']]['path']
    timeout = prop['timeout']

    t0 = time.time()

    try:
        prop['result'] = json.loads(sp.check_output(path,input=package,universal_newlines=True,timeout=timeout))
        prop['status'] = 3
    except sp.TimeoutExpired:
        prop['status'] = 2

    t1 = time.time()

    elapsed = t1-t0

    prop['walltime'] = elapsed

    print('worker',str(pid),'resolved property',ID,'with status',prop['status'],'and walltime',elapsed)
    return prop

def worker(pid,args):
    print('worker',str(pid),'active')

    t_start = time.time()

    with open(args.wdb_info, 'r') as infile:
        wdb_info = json.load(infile)

    wdb = whiplash.wdb(wdb_info["host"],wdb_info["port"],wdb_info["token"])
    print('worker',str(pid),'connected to wdb')

    while True:
        time_left = lambda: 3600*args.time_limit - (time.time()-t_start)
        if time_left() > 0:
            unresolved = get_unresolved(wdb,min(time_left(),args.time_window),batch=True)
            objs = unresolved[0]
            models = unresolved[1]
            executables = unresolved[2]
            if len(objs) > 0:
                print('worker',str(pid),'fetched',len(objs),'properties with',time_left(),'seconds of work left')
                resolved = []
                for obj in objs:
                    if time_left() > obj['property']['timeout']:
                        resolved.append(resolve_object(pid,obj,models,executables))
                    else: break
                commit_resolved(wdb,resolved,batch=True)
                print('worker',str(pid),'commited',len(resolved),'properties')
            else:
                print('no properties currently unresolved')
            time.sleep(1)
        else:
            break

def run(args):

    num_cpus = mp.cpu_count()
    if args.num_cpus != None:
        num_cpus = min(args.num_cpus,num_cpus)
    assert num_cpus > 0

    print('starting workers')
    context = mp.get_context('fork')
    for pid in range(num_cpus):
        context.Process(target=worker, args=(pid,args,)).start()
        time.sleep(5)

    time.sleep(3600*args.time_limit)

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--wdb_info',dest='wdb_info',required=True,type=str)
    parser.add_argument('--time_limit',dest='time_limit',required=True,type=int)
    parser.add_argument('--time_window',dest='time_window',required=True,type=int)
    parser.add_argument('--num_cpus',dest='num_cpus',required=False,type=int)
    parser.add_argument('--log_file',dest='log_file',required=False,type=str,default='scheduler_local_' + str(int(time.time())) + '.log')
    parser.add_argument('--daemonise',dest='daemonise',required=False,default=False,action='store_true')
    args = parser.parse_args()

    if args.daemonise:
        with daemon.DaemonContext(working_directory=os.getcwd(),stdout=open(args.log_file, 'w+')):
            run(args)
    else:
        run(args)
