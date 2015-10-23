#!/usr/bin/env python

import sys
import whiplash

host = sys.argv[1]
port = int(sys.argv[2])
username = sys.argv[3]
password = sys.argv[4]
client_id = sys.argv[5]
client_secret = sys.argv[6]

print("Login")
wdb = whiplash.wdb(host,port,"",username,password,client_id,client_secret)

print("Commit model")
model_id = wdb.models.commit([
{"class":"ising", "body":{"n_spins":4, "edges":[[[0,1],1], [[0,2],1], [[0,3],-1], [[0,4],-1]]}}
])[0]
print model_id

print("Commit executable")
executable_id = wdb.executables.commit([{"name":"test_app", "algorithm":"SA", "version":"1.0.0", "build":"O3", "path":"/home", "class":"ising", "description":"app for testing"}])[0]
print executable_id

print("Commit property")
print wdb.properties.commit([{"timeout":100, "class":"ising", "model_id":model_id, "executable_id":executable_id, "params":{"n_sweeps":"10", "T_1":"1.e-8", "T_0":"10.0", "seed":0}}])