import sys,os

# Make WhiplashDB in_sweepstance
wdb_home = os.environ.get('WDB_HOME')
sys.path.append(wdb_home+'/lib/python')
import whiplashdb
wdb = whiplashdb.wdb(wdb_home)

# Settings
prob_class = 'ising'
owner = 'ebrown'
n_probs = 1
n_reps = 10000
n_sweeps = [10]

# Executable
print 'Committing executables'
executable = {'class':prob_class,'owner':owner,'description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':wdb_home+'/bin/test.app'}
executable_id = wdb.CommitExecutable(executable)
print executable_id

# Models
print 'Committing models'
model = {'class':prob_class,'owner':owner,'lattice_type':'random','coupling_type':'gaussian'}
paths = []
for i_prob in range(n_probs):
    paths.append(wdb_home+'/src/tests/108ising.lat') # Normally would randomly generate these
model_ids = wdb.CommitModels(model, paths)
print model_ids

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
