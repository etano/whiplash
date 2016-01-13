#!/usr/bin/env python3

import whiplash,sys

host = sys.argv[1]
port = int(sys.argv[2])
wdb = whiplash.wdb(host,port,username="test",password="test")

wdb.create_token(username="test",password="test",client_id='test-scheduler',client_secret='test',save_token=False)
