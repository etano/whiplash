#!/usr/bin/env python3
import sys,os,json,random,copy
import whiplash

print("Read inputs")
host = sys.argv[1]
port = int(sys.argv[2])

print("Login as test")
db = whiplash.db(host,port,username="test",password="test")

print("Commit models")
n_models = 10
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
        "n_spins": N,
        "name": "test_set_"+str(k),
        "description": "This is a test model",
        "set": "test_set",
        "owner": "internal",
        "format": "json"
    }
    model = {"content": {"edges": hamiltonian}}
    model.update(tags)
    models.append(model)
model_ids = db.models.commit(models)['ids']

print("Commit models again")
assert model_ids[0] == db.models.commit(models)['ids'][0]

print("Query model")
assert model_ids[0] == db.models.query({"name":"test_set_0"},'_id')[0]['_id']

print("Commit models into a set")
set_id = db.sets.commit([{
    "name": "test_set",
    "description": "This is a test set",
    "ids": model_ids,
    "owner": "internal"
}])['ids'][0]

print("Commit models into a set again")
assert set_id == db.sets.commit([{
    "name": "test_set",
    "description": "This is a test set",
    "ids": model_ids
}])['ids'][0]

print("Query set")
assert set_id == db.sets.query({"name":"test_set"},'_id')[0]['_id']

print("Commit executable")
executable = {
    "name": "test_app",
    "algorithm": "test",
    "version": "test",
    "build": "test",
    "path": "whiplash/sleeper:latest",
    "description": "a test executable",
    "in_format": "json",
    "out_format": "json",
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

print("Submit query for some results")
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
settings = {
    'timeout': 3
}
query_0 = db.submit(filters, settings=settings)
print(query_0)
assert db.status(filters)['total'] == n_models

print("Submit query for some results again")
query_1 = db.submit(filters, settings=settings)
print(query_1)
assert db.status(filters)['total'] == n_models
