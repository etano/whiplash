import matplotlib.pyplot as plt
import sys,os
import time

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
paths = [wdb_home+'/src/tests/108ising.lat']
#paths = []
#for i_prob in range(n_probs):
#    paths.append(wdb_home+'/src/tests/108ising.lat')
model_ids = wdb.CommitModels(model, paths)
print model_ids

# Properties
print 'Committing properties'
for ns in [10,100,1000,10000]:
    for seed in range(1):
        property = {'class':prob_class,'owner':owner,'executable':executable_id,'n_sweeps':ns,'T_0':T_0,'T_1':T_1,'seed':seed}
        property_ids = wdb.CommitProperties(property, model_ids, n_reps)
        print ns,seed,property_ids

time.sleep(10)

# Query
filter = {'class':prob_class}
target = ['cfg','costs']
results = wdb.Query(filter,target)

energies = []

count = 0
for res in results:
    if "Unresolved" in res:
        count += 1
    else:
        energies.append(float(res))

print "Resolved:",len(results)-count
print "Unresolved:",count
print 'energies:',energies

#Plotting
if len(energies) > 1:
    plt.hist(energies,20,histtype='bar',color=['crimson'])
    plt.savefig('tmp.pdf',dpi=600)
    plt.show()
