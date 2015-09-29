import sys
from pymongo import MongoClient
from json import load
from time import time

'''
required_fields = {"ising":["n_spins","edges"],"sat":[...]}
if ising -> n_spins, edges
if sat -> n_variables, couplings
if ... -> ...
'''

if len(sys.argv) == 1:
    print 'Please enter model file'
    sys.exit(0)

data = load(open(sys.argv[1]))

required_fields = ['class','owner','cfg']
for field in required_fields:
    if field not in data:
        print 'Please add property:',field
        sys.exit(0)

models = MongoClient("whiplash.ethz.ch:27017")['wdb']['models']

_id = models.find().count()

data['_id'] = _id
data['timestamp'] = time()

models.insert_one(data)

print _id
