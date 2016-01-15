#!/usr/bin/env python3

import sys,os,whiplash,json,random,copy

print("Login")
host = sys.argv[1]
port = int(sys.argv[2])
wdb = whiplash.wdb(host,port,username="test",password="test")

print("Reset database")
wdb.queries.delete({})
assert wdb.queries.count({}) == 0
wdb.models.delete({})
assert wdb.models.count({}) == 0
wdb.executables.delete({})
assert wdb.executables.count({}) == 0
wdb.properties.delete({})
assert wdb.properties.count({}) == 0

print("Commit model")
N = 4
hamiltonian = []
for i in range(N):
    for j in range(i+1,N):
        value = 2.0*random.random()-1.0
        hamiltonian.append([[i,j],value])
tags = {"n_spins":N, "name":"test"}
model = {"content":{"edges": hamiltonian}}
model.update(tags)
model_id = wdb.models.commit(model)[0]

print("Query model")
assert model_id == wdb.models.query(tags,'_id')[0]['_id']

print("Commit executable")
executable = {"name":"test", "algorithm":"test", "version":"test", "build":"test", "path":os.getcwd()+"/tests/sleeper.py", "description":"test", "params":{"required":["sleep_time"],"optional":[]}}
executable_id = wdb.executables.commit(executable)[0]

print("Query executable")
assert executable_id == wdb.executables.query(executable,'_id')[0]['_id']

print("Query for some results")
filters = {'input_model': {"name":"test"}, 'executable': {"name":"test"}, 'params': {"sleep_time":1.0}, 'output_model': {}}
fields = {'input_model': ["name"], 'executable': ["name"], 'params': ["sleep_time"], 'output_model': ["content.edges"]}
assert len(wdb.query(filters, fields, 10)) == 10
