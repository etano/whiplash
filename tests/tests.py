#!/usr/bin/env python

import sys,whiplash

host = sys.argv[1]
port = int(sys.argv[2])
username = sys.argv[3]
password = sys.argv[4]
client_id = sys.argv[5]
client_secret = sys.argv[6]

print("Login")
wdb = whiplash.wdb(host,port,"",username,password,client_id,client_secret)

wdb.models.delete({})
model = {"class":"ising", "content":{"n_spins":4, "edges":[[[0,1],1], [[0,2],1], [[0,3],-1], [[0,4],-1]]}}

wdb.executables.delete({})
executable = {"name":"test_app", "algorithm":"SA", "version":"1.0.0", "build":"O3", "path":"/home", "class":"ising", "description":"app for testing"}

print("Commit properties")
wdb.properties.delete({})
props = []
for i in range(1000): props.append({"class":"ising", "params":{"n_sweeps":"10", "T_1":"1.e-8", "T_0":"10.0", "seed":i},"timeout":100})
for i in range(1000,1500): props.append({"class":"ising", "params":{"n_sweeps":"10", "T_1":"1.e-8", "T_0":"10.0", "seed":i},"timeout":100,"status":3,"walltime":10})
wdb.properties.submit(model,executable,props)
wdb.properties.check_status()

print('unresolved time: %f',wdb.properties.get_unresolved_time())
print('resolved time: %f',wdb.properties.get_resolved_time())
print('total mistime: %f',wdb.properties.get_total_mistime())
