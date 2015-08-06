import wdb
wdb_home = '/Users/ethan/src/whiplashdb'

# Settings
prob_class = 'ising'
owner = 'ebrown'
n_probs = 100
n_reps = 100
n_sweeps = 1000
schedule = 'linear'
T_0 = 10.0
T_1 = 1e-8
lattice_type = 'square'
coupling_type = 'gaussian'
executable_path = wdb_home+'/src/apps/test.app'

# Executable
print 'Committing executables'
executable = {'class':prob_class,'owner':owner,'description':'','algorithm':'SA','version':'','build':'','schedule':schedule,'path':executable_path}
executable_id = wdb.CommitExecutable(executable)

# Models
print 'Committing models'
model = {'class':prob_class,'owner':owner}
#model_ids = []
#for i_prob in range(n_probs):
#    model['file'] = wdb_home+'/src/apps/108problem.lat' # GenRandomLattice(n_spins,spin_type,lattice_type,coupling_type)
#    model_ids.append(wdb.CommitModel(model))
model['file'] = wdb_home+'/src/apps/108problem.lat' # GenRandomLattice(n_spins,spin_type,lattice_type,coupling_type)
model_ids = wdb.CommitModels(model, n_probs)

# Properties
print 'Committing properties'
property = {'class':prob_class,'owner':owner,'executable':executable_id,'n_sweeps':n_sweeps,'T_0':T_0,'T_1':T_1}
property_ids = wdb.CommitProperties(property, model_ids, n_reps)

## Query
#filter = {'class':prob_class}
#target = {'cfg':'cost'}
#results = wdb.Query(filter,target)
#print results
