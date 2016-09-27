#!/usr/bin/env python3
import sys, json
import whiplash

try:
    assert len(sys.argv) == 3
except:
    print("Usage: ./commit_result.py input.json output.json")
    sys.exit()

print("Login as test user")
db = whiplash.db("localhost", 1337, username="test", password="test")

print("Split input into model and property")
input = json.load(open(sys.argv[1],'r'))
params = input.pop('params')
input_model = input

print("Commit input model")
input_model_id = db.models.commit([input_model])['ids'][0]

print("Commit executable")
executable_id = db.executables.commit({
    "name": "an_ss_rn_fi_vdeg",
    "algorithm": "SA",
    "version": "1.0",
    "type": "docker",
    "path": "whiplash/anc:an_ss_rn_fi_vdeg",
    "description": "Single-spin code for range-n interactions with magnetic field (any number of neighbors)",
    "params": {
        "required": ["edges", "n_sweeps", "n_reps"],
        "optional": ["seed", "T_0", "T_1", "rep_0", "verbose", "lowest", "schedule"]
    }
})['ids'][0]

print("Submit query (property creation)")
filters = {
    'input_model': {'_id': input_model_id},
    'executable': {'_id': executable_id},
    'params': params,
    'output_model': {}
}
settings = {
    'manual': 1
}
print(db.submit(filters, settings))

print("Get property ID")
filter = {
    'input_model_id': input_model_id,
    'executable_id': executable_id
}
for key in params:
    filter['params.'+key] = params[key]
property_id = db.properties.query(filter, ['_id'])[0]['_id']

print("Commit output model")
output_model = json.load(open(sys.argv[2],'r'))
output_model['property_id'] = property_id
output_model_id = db.models.commit([output_model])['ids'][0]

print("Update property with output model ID and set as resolved")
db.properties.update({'_id': property_id}, {'output_model_id': output_model_id, 'status': 'resolved'})
