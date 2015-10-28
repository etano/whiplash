#!/usr/bin/env python3

import os,json,sys,time

data = json.loads(sys.stdin.readline())
time.sleep(2.0)
data['time'] = int(time.time())
sys.stdout.write(json.dumps(data))
