#!/usr/bin/env python3.4

import os,json,sys,time

# input
data = json.loads(sys.stdin.readline())
content_in = data['content']
params = data['params']

# sleep
time.sleep(params['sleep_time'])

# output
tags_out = {'feels':'good to sleep'}
content_out = {'time':int(time.time())}
sys.stdout.write(json.dumps({'tags':tags_out,'content':content_out}))
