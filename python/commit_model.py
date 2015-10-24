#!/usr/bin/env python

import whiplash,json

# Connect to local Whiplash instance
wdb = whiplash.wdb("whiplash.ethz.ch","1337","1a27f0e538d83e5bf1a6f032c18548994a1e954d5f0b0338bdbb5417dd0a9dcb")
model = json.load(open('model.json'))
models = []
for i in range(10):
    models.append(model)
print wdb.models.commit(models)
