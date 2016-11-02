#!/usr/bin/env python3
import sys, json
import whiplash

try:
    assert len(sys.argv) == 4
except:
    print("Usage: ./commit_result.py input.json executable_id output.json")
    sys.exit()

# Login as test user
db = whiplash.db("localhost", 1337, username="test", password="test")

# Split input into model and property
input = json.load(open(sys.argv[1],'r'))
params = input.pop('params')
input_model = input

# Commit input model
input_model_id = db.models.commit([input_model])['ids'][0]

# Submit query (property creation)
executable_id = sys.argv[2]
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

# Get property ID
filter = {
    'input_model_id': input_model_id,
    'executable_id': executable_id
}
for key in params:
    filter['params.'+key] = params[key]
print(db.properties.query(filter, ['_id']))
property_id = db.properties.query(filter, ['_id'])[0]['_id']

# Commit output model
output_model = json.load(open(sys.argv[3],'r'))
output_model['property_id'] = property_id
output_model_id = db.models.commit([output_model])['ids'][0]

# Update property with output model ID and set as resolved
db.properties.update({'_id': property_id}, {'output_model_id': output_model_id, 'status': 'resolved'})
