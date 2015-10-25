#!/usr/bin/env python

import time,whiplash,pymongo,sys,json
import subprocess as sp

class benchmark:
    def __init__(self,server,port,use_pymongo=False):
        self.log_file = "benchmark_" + str(int(time.time())) + '.dat'
        self.log_handle = open(self.log_file,'w')
        self.use_pymongo = use_pymongo
        if self.use_pymongo:
            client = pymongo.MongoClient(server,27017)
            client.wdb.authenticate('api','haYrv{Ak9UJiaDsqVTe7rLJTc',mechanism='SCRAM-SHA-1')
            self.wdb = client.wdb
        else:
            self.wdb = whiplash.wdb(server,port,'','test','test','test','test')

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.log_handle.close()
        print('logs in ' + self.log_file)

    def clean(self):
        if self.use_pymongo:
            self.wdb.properties.drop()
            self.wdb.models.drop()
            self.wdb.executables.drop()
        else:
            print 'ERROR: Clean not implemented for API'
            sys.exit()

    def log_timer(self,func,description):
        t0 = time.time()
        res = func()
        t1 = time.time()
        log = description+" : "+str(len(res))+" objects : "+str(t1-t0)+" seconds"
        print(log)
        self.log_handle.write(log+"\n")
        return res

    def get_collection(self,collection):
        if collection == "properties":
            return self.wdb.properties
        elif collection == "models":
            return self.wdb.models
        elif collection == "executables":
            return self.wdb.executables
        else:
            print("collection does not exist")
            sys.exit(0)

    def do_commit(self,collection,objs):
        if self.use_pymongo:
            return self.get_collection(collection).insert_many(objs).inserted_ids
        else:
            return self.get_collection(collection).commit(objs)

    def commit(self,collection,obj,N):
        try:
            obj = json.load(open(obj))
        except:
            obj = obj
        objs = []
        for i in range(N):
            objs.append(obj.copy())
        return self.log_timer(lambda: self.do_commit(collection,objs),"commit " + collection)

    def do_query(self,collection,objs):
        if self.use_pymongo:
            docs = []
            for doc in self.get_collection(collection).find(objs):
                docs.append(doc)
            return docs
        else:
            return self.get_collection(collection).query(objs)

    def query(self,collection,fltr):
        return self.log_timer(lambda: self.do_query(collection,fltr),"query " + collection + " on " + str(fltr))

    def resolve(self,method):
        if method == "scheduler":
            return self.log_timer(lambda: sp.call("./scheduler.py --num_cpus 2 --exit_on_resolved"),"resolve with scheduler")
        elif method == "native":
            return self.log_timer(lambda: sp.call("./client_native"),"resolve with native")
        elif method == "script":
            return self.log_timer(lambda: sp.call("./resolve.py"),"resolve with script")
        else:
            print("method not defined")
            sys.exit(0)
