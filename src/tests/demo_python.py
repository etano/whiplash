import sys,os

# Make WhiplashDB in_sweepstance
wdb_home = os.environ.get('WDB_HOME')
sys.path.append(wdb_home+'lib/python')
import whiplashdb
#wdb = whiplashdb.wdb(wdb_home,"cwave.ethz.ch:27017")
wdb = whiplashdb.wdb(wdb_home,"whiplash-dev.ethz.ch:27017")

# Settings
prob_class = 'ising'
owner = 'ebrown'
n_reps = 10000
n_sweeps = [10]

# Models
print 'Committing models'
model = {'class':prob_class,'owner':owner,'lattice_type':'random','coupling_type':'gaussian','path':wdb_home+'/src/tests/108ising.lat'}
model_ids = wdb.CommitModel(model)
print model_ids

executable_id = 0

# Properties
print 'Committing properties'
for n_sweep in n_sweeps:
    property = {'class':prob_class,'owner':owner,'executable':executable_id,'n_sweeps':n_sweep,'T_0':10.0,'T_1':1e-8}
    property_ids = wdb.CommitProperties(property, model_ids, n_reps)
    print property_ids

# Form query
filter = {'class':prob_class}
target = ['cfg','costs']

# Query and update plot continuously
wdb.RealTimeHist(filter, target)
