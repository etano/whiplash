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
print wdb.models.commit([
{"class":"ising", "body":{"n_spins":4, "edges":[[[0,1],1], [[0,2],1], [[0,3],-1], [[0,4],-1]]}}
])

print("Commit executable")
print wdb.executables.commit([{"name":"test_app", "algorithm":"SA", "version":"1.0.0", "build":"O3", "path":"/home", "class":"ising", "description":"app for testing"}])

print("Commit property")
print wdb.properties.commit([{"timeout":2.0, "class":"ising", "model_id":0, "executable_id":0, "params":{"n_sweeps":"10", "T_1":"1.e-8", "T_0":"10.0", "seed":0}}])
