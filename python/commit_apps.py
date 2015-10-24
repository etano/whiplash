#!/usr/bin/env python
import json
import whiplash

print 'Connecting to whiplash'
wdb = whiplash.wdb("whiplash.ethz.ch","1337","1534d75d461100ab696aaac2e800d2ec7c88172d6394b89bfc6566611d1ef99f")

print 'Commiting executables'
apps = json.load(open('apps.json'))
executable_ids = wdb.executables.commit(apps['apps'])
print executable_ids
