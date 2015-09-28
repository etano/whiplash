#
# This demo script fetches models froms the database, registers a solver, form property requests, runs the solver on them locally, and finally pushes back resolved properties
#

# Make WhiplashDB instance
import sys,os
wdb_home = os.environ.get('WDB_HOME')
sys.path.append(wdb_home+'lib/python')
import whiplashdb
wdb = whiplashdb.wdb(wdb_home,"whiplash.ethz.ch:27017")

# Fetch models
print 'Fetching models'
model_filter = {'class':'ising','owner':'ebrown','lattice_type':'random','coupling_type':'gaussian'}
model_ids = wdb.FetchModels(model_filter)

# Register solver
executable = {'class':'ising','owner':'ebrown','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':wdb_home+'/bin/test.app'}
executable_id = wdb.CommitExecutable(executable)

# Form property requests
print 'Form property requests'
property = {'class':'ising','owner':'ebrown','executable':executable_id,'n_sweeps':10,'T_0':10.0,'T_1':1e-8}
property_json = wdb.FormProperties(property, model_ids, n_reps=10000)

# Call solver to resolve properties
properties = []
for p in property_json:
    # Call solver with argument p
    properties.append(  solver(p)  ) # FIXME: use subprocess or whatever

# Commit properties
property_ids = wdb.CommitProperties(properties)

# Form query
filter = {'class':prob_class}
target = ['cfg','costs']

# Query and update plot continuously
wdb.RealTimeHist(filter, target)
