#!/usr/bin/env python3
import sys, random
import whiplash

print("Login as test user")
db = whiplash.db("localhost", 1337, username="test", password="test")

print("Submit a query for the spin glass solver and instances")
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
settings = {
    'timeout': 600 # seconds
}
print(db.submit(filters, settings))
