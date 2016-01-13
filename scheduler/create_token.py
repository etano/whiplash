#!/usr/bin/env python3

import whiplash,sys

host = sys.argv[1]
port = int(sys.argv[2])
username = sys.argv[3]
password = sys.argv[4]
wdb = whiplash.wdb(host,port,username=username,password=password)

wdb.create_token(username=username,password=password,client_id=username+'-scheduler',client_secret=password,save_token=False)
