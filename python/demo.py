#!/usr/bin/env python3.4

import whiplash

#CONNECT TO WHIPLASH
host = "whiplash.ethz.ch"
port = 443
token = "dc1373b7b0b4099c88937e2e0ed3ba87908588d675e9f28f87ae2ba83733d344"
wdb = whiplash.wdb(host,port,token)

#DEFINE MODEL
model = {"class":"ising","description":"unitary evolution test","content":{"n_spins":5,"edges":[[[0,1],1],[[0,2],1],[[0,3],-1],[[0,4],-1]]}}

#SUBMIT PROPERTIES
properties = []
for i in range(100000):
    properties.append({"params":{"hx":-1,"Ttot":500,"nsteps":400,"seed":i},"timeout":3})
wdb.properties.submit(model,executable,properties)

#CHECK STATUS
wdb.properties.check_status()

#GET RESULTS
properties = wdb.properties.query({"status":3})
