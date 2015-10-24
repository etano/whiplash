#!/usr/bin/env python

import json,whiplash,sys,time
#import matplotlib.pyplot as plt

with open('wdb_info_local.json', 'r') as infile: wdb_info = json.load(infile)
wdb = whiplash.wdb(wdb_info["host"],wdb_info["port"],wdb_info["token"])

wdb.executables.delete({})
executable = {"class":"testing","description":"test app","algorithm":"sleep","name":"sleeper","version":"1.0.0","build":"O0","path":"/Users/ilia/ETH-Data/workspace/whiplash/whiplash-python/client"}
wdb.executables.commit(executable)
executable_id = wdb.executables.query_field_only('_id',{"class":"testing"})[0]
print(executable_id)

wdb.models.delete({})
model = {"class":"testing","description":"sleep model","body":"empty"}
wdb.models.commit(model)
model_id = wdb.models.query_field_only('_id',{"class":"testing"})[0]
print(model_id)

wdb.properties.delete({})
prop = {"model_id":model_id,"executable_id":executable_id,"params":{"first":"None"},"timeout":120}
props = []
for i in range(1000):
    props.append(prop)
wdb.properties.commit(props)
wdb.properties.check_status()
print(wdb.properties.fetch_work_batch(130))
wdb.properties.check_status()

# Ts = []
# Ns = []
# for exp in range(1,20):

#     N = 1 << exp

#     wdb.properties.delete({})
#     prop = {"model_id":model_id,"executable_id":executable_id,"params":{"first":"None"},"timeout":120}
#     props = []
#     for i in range(N):
#         props.append(prop)
#     t0 = time.time()
#     wdb.properties.commit(props)
#     t1 = time.time()
#     elapsed = t1-t0

#     Ns.append(N)
#     Ts.append(elapsed)
#     print(N,elapsed)        
#     #print(wdb.properties.count({"status":0}),wdb.properties.count({"status":1}))
#     #print(wdb.properties.fetch_work_batch(130))
#     #print(wdb.properties.count({"status":0}),wdb.properties.count({"status":1}))
        
# plt.plot(Ns,Ts,'-o')
# plt.show()
