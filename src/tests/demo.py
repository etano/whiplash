#!/usr/bin/env python

import sys,time
import whiplashdb

print 'Connecting to whiplash'
wdb = whiplashdb.wdb(sys.argv[1])

print 'Commiting a model'
model_id = wdb.CommitModel('108ising.json')

print 'Commiting an executable'
executable_id = wdb.CommitExecutable({'class':'ising','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'./bin/test_app.shared','name':'test'})

print 'Commiting a property'
params = {'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8'}
property_id = wdb.CommitProperty(wdb.FormProperty('ising',model_id,executable_id,0,0,params))

print 'Waiting...'
time.sleep(3)

print 'Fetching result...'
print wdb.FetchProperty(property_id)['cfg']['costs']
