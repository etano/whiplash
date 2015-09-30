#
# This demo script fetches models froms the database, registers a
# solver, form property requests, runs the solver on them locally,
# pushes back resolved properties, and finally plots a histogram of
# results
#

# Make WhiplashDB instance
import sys,os
wdb_home = os.environ.get('WDB_HOME')
sys.path.append(wdb_home+'lib/python')
import whiplashdb
from subprocess import Popen, PIPE
import json
wdb = whiplashdb.wdb(wdb_home,"whiplash.ethz.ch:27017")

# Fetch models
print 'Querying for models'
model_filter = {'class':'ising','owner':'ebrown','params.lattice_type':'random','params.coupling_type':'gaussian'}
model_ids = wdb.QueryModels(model_filter)
print model_ids

# Register solver
print 'Registering solver'
executable = {'class':'ising','owner':'ebrown','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':wdb_home+'/bin/test.shared'}
executable_id = wdb.CommitExecutable(executable)
print executable_id

# Form property requests and solve them on local solver
print 'Form property requests and solve them'
properties = []
for model_id in model_ids:
    property = {'class':'ising','owner':'ebrown','executable_id':executable_id,'model_id':model_id,'n_sweeps':10,'T_0':10.0,'T_1':1e-8}
    model = wdb.FetchModel(model_id)
    executable = wdb.FetchExecutable(executable_id)
    for i in range(10000):
        # Packaged executables (SA, SQA, UE) take JSON input and give JSON output
        # though in general user is free to do this how they please

        # Write JSON file
        input_path = executable['path']+'.tmp.json'
        f = open(input_path,'w')
        f.write(json.dumps({'property':property,'model':model}))

        # Run solver
        p = Popen([executable['path'],input_path],stdout=PIPE,stderr=PIPE,bufsize=1)
        (stdout, stderr) = p.communicate()
        properties.append(json.loads(stdout))

# Commit resolved properties
property_ids = wdb.CommitProperties(properties)

# Form query
filter = {'class':prob_class}
target = ['cfg','costs']

# Query and update plot continuously
wdb.RealTimeHist(filter, target)
