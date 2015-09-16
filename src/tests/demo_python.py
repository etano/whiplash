import sys,os

# Make WhiplashDB instance
wdb_home = os.environ.get('WDB_HOME')
sys.path.append(wdb_home+'/lib/python')
import whiplashdb
wdb = whiplashdb.wdb(wdb_home)

# Settings
prob_class = 'ising'
owner = 'ebrown'
n_probs = 10
n_reps = 1
n_sweeps = 100
schedule = 'linear'
T_0 = 10.0
T_1 = 1e-8
lattice_type = 'square'
coupling_type = 'gaussian'
executable_path = wdb_home+'/bin/test.app'

# Executable
print 'Committing executables'
executable = {'class':prob_class,'owner':owner,'description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':schedule,'path':executable_path}
executable_id = wdb.CommitExecutable(executable)
print executable_id

# Models
print 'Committing models'
model = {'class':prob_class,'owner':owner}
paths = []
for i_prob in range(n_probs):
    paths.append(wdb_home+'/src/tests/108problem.lat')
model_ids = wdb.CommitModels(model, paths)
print model_ids

# Properties
print 'Committing properties'
property = {'class':prob_class,'owner':owner,'executable':executable_id,'n_sweeps':n_sweeps,'T_0':T_0,'T_1':T_1}
property_ids = wdb.CommitProperties(property, model_ids, n_reps)
print property_ids

# Query
print 'Querying'
filter = {'class':prob_class}
target = ['cfg','costs']
results = [x for x in wdb.Query(filter,target)]
print results
