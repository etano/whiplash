#!/usr/bin/python3

import json, sys, time

t0 = time.time()

file_name = sys.argv[1]

with open(file_name, 'r') as infile:
    data = json.load(infile)

ta = time.time()
while 1:
    tb = time.time()
    if (tb-ta) > data["params"]["run_time"]:
        break

t1 = time.time()
with open(file_name, 'w') as outfile:
    json.dump({"time": t1-t0}, outfile)
