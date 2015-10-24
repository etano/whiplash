#!/usr/bin/env python

import time,whiplash,pymongo,sys,json
import subprocess as sp

class benchmark:
    def __init__(self,server,port,token):
        self.log_file = "benchmark_" + str(int(time.time())) + '.dat'
        self.log_handle = open(self.log_file,'w')
        self.wdb = whiplash.wdb(server,port,token)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.log_handle.close()
        print('logs in ' + self.log_file)

    def log_timer(self,func,description):
        t0 = time.time()
        func()
        t1 = time.time()
        log = description+": "+str(t1-t0)
        print(log)
        self.log_handle.write(log+"\n")

    def commit(self,collection,file_name,N):
        obj = json.load(open(file_name))
        objs = []
        for i in range(N):
            objs.append(obj)

        if collection == "properties":
            self.log_timer(lambda: self.wdb.properties.commit(objs),"commit " + str(N) + " " + collection)
        elif collection == "models":
            self.log_timer(lambda: self.wdb.models.commit(objs),"commit " + str(N) + " " + collection)
        elif collection == "executables":
            self.log_timer(lambda: self.wdb.executables.commit(objs),"commit " + str(N) + " " + collection)
        else:
            print("collection does not exist")
            sys.exit(0)

    def query(self,collection,fltr):

        if collection == "properties":
            self.log_timer(lambda: self.wdb.properties.query(fltr),"query " + collection + " on " + str(fltr))
        elif collection == "models":
            self.log_timer(lambda: self.wdb.models.query(fltr),"query " + collection + " on " + str(fltr))
        elif collection == "executables":
            self.log_timer(lambda: self.wdb.executables.query(fltr),"query " + collection + " on " + str(fltr))
        else:
            print("collection does not exist")
            sys.exit(0)

    def resolve(self,method):

        if method == "scheduler":
            self.log_timer(lambda: sp.call("./scheduler.py --num_cpus 2 --exit_on_resolved"),"resolve with scheduler")
        elif method == "native":
            self.log_timer(lambda: sp.call("./client_native"),"resolve with native")
        elif method == "script":
            self.log_timer(lambda: sp.call("./resolve.py"),"resolve with script")
        else:
            print("method not defined")
            sys.exit(0)
