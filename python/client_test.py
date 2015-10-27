#!/usr/bin/env python

import json,whiplash,sys,time,math

with open('wdb_info_local.json', 'r') as infile: wdb_info = json.load(infile)
#wdb = whiplash.wdb(wdb_info["host"],wdb_info["port"],wdb_info["token"])
wdb = whiplash.wdb(wdb_info["host"],wdb_info["port"],username="test",password="test",client_id="test",client_secret="test")

wdb.executables.delete({})
path = "/Users/ilia/ETH-Data/workspace/whiplash/whiplash/python/sleeper2"
#path = "/users/whiplash/whiplash/whiplash/python/sleeper2"
executable = {"class":"testing","description":"test app","algorithm":"sleep","name":"sleeper","version":"1.0.0","build":"O0","path":path}

wdb.models.delete({})
model = {"class":"testing","description":"sleep model","content":"empty"}

wdb.properties.delete({})
props = []
for i in range(1000): props.append({"params":{"first":"None","seed":i},"timeout":1})
for i in range(1000,1500): props.append({"params":{"first":"None","seed":i},"timeout":1,"status":3,"walltime":0.5})
wdb.properties.submit(model,executable,props)
wdb.properties.check_status()

print(wdb.properties.get_unresolved(3))

sys.exit(0)

wdb.properties.check_status()

t0 = time.time()
print('unresolved time:',wdb.properties.get_unresolved_time())
print(time.time()-t0)

t0 = time.time()
print('average fuckup:',wdb.properties.get_average_fuckup())
print(time.time()-t0)

time.sleep(4)
wdb.properties.refresh()
wdb.properties.check_status()

#import matplotlib.pyplot as plt

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
