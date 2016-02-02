#!/usr/bin/env python3

import whiplash,sys

host = sys.argv[1]
port = int(sys.argv[2])
username = sys.argv[3]
password = sys.argv[4]

conn = whiplash.connection(host,port,username=username,password=password)
conn.create_token(username=username,password=password,client_id=username+'-scheduler',client_secret=password)
