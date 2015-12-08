#!/usr/bin/env python

import os,json,sys,time

# input
f = open(sys.argv[1],'r')
data = json.load(f)
f.close()

content_in = data['content']
params = data['params']

# sleep
time.sleep(params['sleep_time'])

# output
content_out = {'time':int(time.time())}
f = open(sys.argv[1],'w')
f.write(json.dumps({'feels':'good to sleep','content':content_out}))
f.close()
