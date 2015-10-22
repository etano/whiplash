#!/usr/bin/env python
import json
import whiplash

wdb = whiplash.wdb("whiplash.ethz.ch","80","dc1373b7b0b4099c88937e2e0ed3ba87908588d675e9f28f87ae2ba83733d344")

app = {"class":"testing","description":"test app","algorithm":"sleep","name":"sleeper","version":"1.0.0","build":"O0","path":"/Users/ilia/ETH-Data/workspace/whiplash/whiplash-python/client"}
#executable_ids = wdb.executables.commit(app)
executable_id = wdb.executables.query_for_ids({"class":"testing"})[0]
print executable_id

model = {"class":"testing","description":"sleep model","body":"empty"}
#wdb.models.commit(model)
model_id = wdb.models.query_for_ids({"class":"testing"})[0]
print model_id

#prop = {"model_id":model_id,"executable_id":executable_id,"params":{"first":"None"}}
#for i in range(1000): wdb.properties.commit(prop)
#wdb.properties.delete({})
print wdb.properties.count({"status":"unresolved"}),wdb.properties.count({"status":"pulled"})
#for i in range(100):
#    print wdb.properties.count({"status":"unresolved"}),wdb.properties.count({"status":"pulled"})
#    wdb.properties.get_unresolved()
#    raw_input()

#prop_ids = wdb.properties.query_for_ids({"status":"unresolved"})
#print prop_ids
#print wdb.properties.count({"status":"unresolved"})

