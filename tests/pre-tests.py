#!/usr/bin/env python3
import sys,os,json,random,copy
import whiplash

print("Login")
host = sys.argv[1]
port = int(sys.argv[2])
db = whiplash.db(host,port,username="test",password="test")

#print("Reset database")
#db.collection("work_batches").delete({})
#db.queries.delete({})
#assert db.queries.count({}) == 0
#db.models.delete({})
#assert db.models.count({}) == 0
#db.executables.delete({})
#assert db.executables.count({}) == 0
#db.properties.delete({})
#assert db.properties.count({}) == 0

print("Commit models")
n_models = 20
models = []
random.seed(0)
for k in range(n_models):
    N = 5
    hamiltonian = []
    for i in range(N):
        for j in range(i+1,N):
            value = 2.0*random.random()-1.0
            hamiltonian.append([[i,j],value])
    tags = {
        "n_spins":N,
        "name":"test_set_"+str(k),
        "set":"test_set"
    }
    model = {"content":{"edges":hamiltonian}}
    model.update(tags)
    models.append(model)
model_id = db.models.commit(models)['ids'][0]

print("Commit models again")
assert model_id == db.models.commit(models)['ids'][0]

print("Query model")
assert model_id == db.models.query({"name":"test_set_0"},'_id')[0]['_id']

print("Commit executable")
executable = {
    "name": "test_app",
    "algorithm": "test",
    "version": "test",
    "build": "test",
    "path": "whiplash/sleeper:latest",
    "description": "a test executable",
    "params": {
        "required": ["sleep_time"],
        "optional": []
    }
}
executable_id = db.executables.commit(executable)['ids'][0]

print("Commit executable again")
assert executable_id == db.executables.commit(executable)['ids'][0]

print("Query executable")
assert executable_id == db.executables.query(executable,'_id')[0]['_id']

print("Query for some results")
filters = {
    'input_model': {"set": "test_set"},
    'executable': {"name": "test_app"},
    'params':{
        "sleep_time": 1.0,
        "seed": 0
    },
    'output_model': {}
}
fields = {
    'input_model': ["set","name"],
    'executable': ["name"],
    'params': ["sleep_time"],
    'output_model': ["number"]
}
settings = {'timeout': 300, 'get_results': 1}
query_0 = db.query(filters, fields, settings)
assert db.query(filters, fields)['total'] == n_models

print("Query for some results again")
query_1 = db.query(filters, fields, settings)
assert db.query(filters, fields)['total'] == n_models
