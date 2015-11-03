#!/usr/bin/env python

import whiplash

#CONNECT TO WHIPLASH
host = "whiplash.ethz.ch"
port = 443
token = "51ffa798e4e00b801dd88f367030cc85134d331bcf817b0b8d8ccd78c6c9ff4b"
wdb = whiplash.wdb(host,port,token)

#DEFINE MODEL
model = {"class":"ising","description":"unitary evolution test","content":{"n_spins":5,"edges":[[[0,1],1],[[0,2],1],[[0,3],-1],[[0,4],-1]]}}

#QUERY FOR EXECUTABLE
executable = wdb.executables.query({"algorithm":"UE"})

#SUBMIT PROPERTIES
properties = []
for i in range(1000):
    properties.append({"params":{"hx":-1,"Ttot":500,"nsteps":400,"seed":i},"timeout":3})
wdb.properties.submit(model,executable,properties)

#CHECK STATUS
wdb.properties.check_status()

#GET RESULTS
properties = wdb.properties.query({"status":3})
