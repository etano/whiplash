import sys,os
from subprocess import Popen, PIPE
import json
import whiplashdb

# Make WhiplashDB instance
wdb = whiplashdb.wdb("localhost:27017")

# Fetch models
print 'Querying for models'
model_filter = {'class':'ising','owner':'ebrown','params.lattice_type':'random','params.coupling_type':'gaussian'}
model_ids = wdb.QueryModels(model_filter)
print model_ids

# Register solver
print 'Registering solver'
executable = {'class':'ising','owner':'ebrown','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'../../bin/test.static'}
executable_id = wdb.CommitExecutable(executable)
print executable_id

# Form property requests and solve them on local solver
print 'Form property requests and solve them'
properties = []
for model_id in model_ids:
    property = {'class':'ising','owner':'ebrown','executable_id':executable_id,'model_id':model_id,'params':{'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8'},'status':3,'walltime':-1.0}
    model = wdb.FetchModel(model_id)
    executable = wdb.FetchExecutable(executable_id)
    for i in range(100):
        property['seed'] = i
        # Packaged executables (SA, SQA, UE) take JSON input and give JSON output
        # though in general user is free to do this how they please

        # Write JSON file
        input_path = executable['path']+'.tmp.json'
        f = open(input_path,'w')
        f.write(json.dumps({'property':property,'model':model}))

        # Run solver
        env = os.environ.copy()
        p = Popen(['./apps/test.static','./apps/test.static.tmp.json'],stdout=PIPE,env=env)
        (stdout,stderr) =  p.communicate()
        properties.append(json.loads(stdout))

# Commit resolved properties
property_ids = wdb.CommitProperties(properties)

# Form query
filter = {'class':'ising','owner':'ebrown'}
target = ['cfg','costs']

# Query and update plot continuously
wdb.RealTimeHist(filter, target)
