#!/usr/bin/env python3
import sys,os,json,random,copy
import whiplash

print("Login")
host = sys.argv[1]
port = int(sys.argv[2])
db = whiplash.db(host,port,username="test",password="test")

print("Check that ids match")
props = db.properties.query({}, ['output_model_id'])
id_dict = {}
for prop in props:
    id_dict[prop['output_model_id']] = prop['_id']
output_models = db.models.query({"number": 8}, ['property_id'])
assert len(output_models) == len(props)
for model in output_models:
    assert model['property_id'] == id_dict[model['_id']]
