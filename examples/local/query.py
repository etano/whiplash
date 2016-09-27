#!/usr/bin/env python3
import sys, random
import whiplash

print("Login as test user")
db = whiplash.db("localhost", 1337, username="test", password="test")

print("Check the status of a query for the spin glass solver and instances")
filters = {
    'input_model': {"set": "test_set"},
    'executable': {"name": "an_ss_ge_fi_vdeg"},
    'params':{
        "n_sweeps": 100,
        "n_reps": 10,
        "seed": 0
    },
    'output_model': {}
}
fields = {
    'input_model': ["set","name"],
    'executable': ["name"],
    'params': ["n_sweeps", "n_reps"],
    'output_model': ["configurations"]
}
print(db.query(filters, fields))
