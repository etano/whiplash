#!/usr/bin/env python3

import sys,whiplash

host = sys.argv[1]
port = int(sys.argv[2])
username = sys.argv[3]
password = sys.argv[4]
client_id = sys.argv[5]
client_secret = sys.argv[6]

print("Login")
wdb = whiplash.wdb(host,port,"",username,password,client_id,client_secret)

wdb.models.delete({})
model = {"tags":{"test":"test"}, "content":{"test":"test"}}

wdb.executables.delete({})
executable = {"name":"test", "algorithm":"test", "version":"test", "build":"test", "path":"./tests/sleeper.py", "description":"test"}

print("Commit properties")
wdb.properties.delete({})
props = []
for i in range(1000): props.append({"params":{"sleep_time":1.0,"seed":i}, "timeout":3})
for i in range(1000,1500): props.append({"params":{"sleep_time":1.0, "seed":i}, "timeout":3, "status":3, "walltime":1.05})
wdb.properties.submit(model,executable,props)
wdb.properties.check_status()

print('unresolved time: %f'%(wdb.properties.get_unresolved_time()))
print('resolved time: %f'%(wdb.properties.get_resolved_time()))
print('average mistime: %f'%(wdb.properties.get_average_mistime()))
