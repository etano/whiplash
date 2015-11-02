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
hamiltonian = [[[1,2],1],[[2,3],1],[[3,4],-1],[[4,1],1]]
model = {"content":{"edges": hamiltonian},"tags":{"n_spins":4,"name":"test"}}
model_id = wdb.models.commit(model)['ids'][0]['_id']

print("Query model")
assert model_id == wdb.models.query_field_only('_id',model['tags'])[0]

print("Commit executable")
executable = {"name":"test", "algorithm":"test", "version":"test", "build":"test", "path":"./tests/sleeper.py", "description":"test"}
executable_id = wdb.executables.commit(executable)['ids'][0]['_id']

print("Query executable")
assert executable_id == wdb.executables.query_field_only('_id',executable)[0]

print("Submit properties")
props = []
for i in range(1000): props.append({"params":{"sleep_time":1.0,"seed":i}, "timeout":1})
for i in range(1000,2000): props.append({"params":{"sleep_time":1.0, "seed":i}, "timeout":1, "status":3, "walltime":2.0})
wdb.properties.submit(model,executable,props)

print("Check status")
assert wdb.properties.get_unresolved_time() == 1000
assert wdb.properties.get_resolved_time() == 2000
assert wdb.properties.get_average_mistime() == -0.51000
