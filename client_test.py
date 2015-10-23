#!/usr/bin/env python
import json,whiplash,sys

with open('wdb_info.json', 'r') as infile: wdb_info = json.load(infile)
wdb = whiplash.wdb(wdb_info["host"],wdb_info["port"],wdb_info["token"])

app = {"class":"testing","description":"test app","algorithm":"sleep","name":"sleeper","version":"1.0.0","build":"O0","path":"/Users/ilia/ETH-Data/workspace/whiplash/whiplash-python/client"}
#executable_ids = wdb.executables.commit(app)
executable_id = wdb.executables.query_field_only('_id',{"class":"testing"})[0]
print executable_id

model = {"class":"testing","description":"sleep model","body":"empty"}
#wdb.models.commit(model)
model_id = wdb.models.query_field_only('_id',{"class":"testing"})[0]
print model_id

prop = {"model_id":model_id,"executable_id":executable_id,"params":{"first":"None"},"timeout":120}
for i in range(1000): wdb.properties.commit(prop)

print wdb.properties.count({"status":"unresolved"}),wdb.properties.count({"status":"pulled"})

#wdb.properties.delete({})

#wdb.properties.delete({})
#prop_ids = wdb.properties.query_for_ids({"status":"unresolved"})
#print prop_ids
#print wdb.properties.count({"status":"unresolved"})
