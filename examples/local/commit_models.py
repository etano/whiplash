#!/usr/bin/env python3
import sys, random
import whiplash

print("Login as test user")
db = whiplash.db("localhost", 1337, username="test", password="test")

print("Commit spin glass models")
n_models = 10
n_spins = 5
models = []
random.seed(0)
for k in range(n_models):
    edges = []
    for i in range(n_spins):
        for j in range(i+1,n_spins):
            edges.append([[i,j], 2*random.random()-1])
    tags = {
        "n_spins": n_spins,
        "name": "test_set_"+str(k),
        "description": "This is a test spin glass model",
        "set": "test_set",
        "format": "json"
    }
    model = {"content": {"edges": edges}}
    model.update(tags)
    models.append(model)
model_ids = db.models.commit(models)['ids']

print("Commit models into a set")
set = {
    "name": "test_set",
    "description": "This is a set of test spin glass models",
    "ids": model_ids
}
print(db.sets.commit([set]))
