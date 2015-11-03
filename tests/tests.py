#!/usr/bin/env python3

import sys,whiplash,json,random

print("Login")
host = sys.argv[1]
port = int(sys.argv[2])
username = sys.argv[3]
password = sys.argv[4]
client_id = sys.argv[5]
client_secret = sys.argv[6]

wdb = whiplash.wdb(host,port,"",username,password,client_id,client_secret)

print("Reset database")
wdb.models.delete({})
assert wdb.models.count({}) == 0
wdb.executables.delete({})
assert wdb.executables.count({}) == 0
wdb.properties.delete({})
assert wdb.properties.count({}) == 0

print("Commit model")
N = 100
hamiltonian = []
for i in range(N):
    for j in range(i+1,N):
        value = 2.0*random.random()-1.0
        hamiltonian.append([[i,j],value])
model = {"content":{"edges": hamiltonian},"tags":{"n_spins":N,"name":"test"}}
model_id = wdb.models.commit(model)['ids'][0]['_id']

print("Query model")
assert model_id == wdb.models.query_field_only('_id',model['tags'])[0]

print("Commit executable")
executable = {"name":"test", "algorithm":"test", "version":"test", "build":"test", "path":"./tests/sleeper.py", "description":"test"}
executable_id = wdb.executables.commit(executable)['ids'][0]['_id']

print("Query executable")
assert executable_id == wdb.executables.query_field_only('_id',executable)[0]

print("Submit properties")
N0 = 10000; t0 = 1.0
N1 = 10000; t1 = 2.0; w1 = 1.0
props = []
for i in range(N0): props.append({"params":{"sleep_time":1.0,"seed":i}, "timeout":t0})
for i in range(N0,N0+N1): props.append({"params":{"sleep_time":1.0, "seed":i}, "timeout":t1, "status":3, "walltime":w1})
wdb.properties.submit(model,executable,props)

print("Check status")
assert wdb.properties.get_unresolved_time() == N0*t0
assert wdb.properties.get_resolved_time() == N1*w1
assert abs(wdb.properties.get_average_mistime()/((t1-w1)/w1) - 1.0) < 0.05
