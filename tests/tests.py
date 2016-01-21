#!/usr/bin/env python3
import sys,os,json,random,copy
import whiplash

print("Login")
host = sys.argv[1]
port = int(sys.argv[2])
db = whiplash.db(host,port,username="test",password="test")

print("Reset database")
db.collection("work_batches").delete({})
db.queries.delete({})
assert db.queries.count({}) == 0
db.models.delete({})
assert db.models.count({}) == 0
db.executables.delete({})
assert db.executables.count({}) == 0
db.properties.delete({})
assert db.properties.count({}) == 0

print("Commit model")
N = 4
hamiltonian = []
for i in range(N):
    for j in range(i+1,N):
        value = 2.0*random.random()-1.0
        hamiltonian.append([[i,j],value])
tags = {"n_spins":N, "name":"test"}
model = {"content":{"edges":hamiltonian}}
model.update(tags)
model_id = db.models.commit(model)[0]

print("Query model")
assert model_id == db.models.query(tags,'_id')[0]['_id']

print("Commit executable")
executable = {"name":"test", "algorithm":"test", "version":"test", "build":"test", "path":os.getcwd()+"/tests/sleeper.py", "description":"test", "params":{"required":["sleep_time"], "optional":[]}}
executable_id = db.executables.commit(executable)[0]

print("Query executable")
assert executable_id == db.executables.query(executable,'_id')[0]['_id']

print("Query for some results")
filters = {'input_model':{"name":"test"}, 'executable':{"name":"test"}, 'params':{"sleep_time":1.0}, 'output_model':{}}
fields = {'input_model':["name"], 'executable':["name"], 'params':["sleep_time"], 'output_model':["content.edges"]}
settings = {'timeout':3, 'n_rep':10}
print(db.query(filters, fields, settings))
assert len(db.query(filters, fields, settings)) == 10
