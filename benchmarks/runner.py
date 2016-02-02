#!/usr/bin/env python

import json,sys,time
t0 = time.time()

file_name = sys.argv[1]

with open(file_name, 'r') as infile:
    data = json.load(infile)

time.sleep(data["params"]["run_time"])

with open(file_name, 'w') as outfile:
    json.dump({"time":time.time()-t0}, outfile)
