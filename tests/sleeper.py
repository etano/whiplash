#!/usr/bin/env python

import json,sys,time

file_name = sys.argv[1]

with open(file_name, 'r') as infile:
    data = json.load(infile)

time.sleep(data["params"]["sleep_time"])

with open(file_name, 'w') as outfile:
    json.dump({"number":8}, outfile)
