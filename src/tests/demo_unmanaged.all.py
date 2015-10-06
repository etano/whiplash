import whiplashdb

# Connect to local WhiplashDB instance
wdb = whiplashdb.wdb("192.168.99.100:27017")

# Query for models
model_filter = {'class':'ising','params.coupling_type':'gaussian','params.lattice':'random'}
model_ids = wdb.QueryModels(model_filter)
print model_ids

# Query for executable
executable_filter = {'class':'ising','algorithm':'SA','name':'an_ss_ge_fi_vdeg'}
executable_id = wdb.QueryExecutables(executable_filter)[0]
print executable_id

# Commit properties
params = {'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8'}
status = 0 # commit properites as unresolved
properties = []
for i in range(len(model_ids)):
    seed = i
    properties.append(wdb.FormProperty('ising',model_ids[i],executable_id,status,seed,params))
wdb.CommitProperties(properties)

# Scheduler is triggered locally

# Query and update plot continuously
filter = {'class':'ising'}
target = ['cfg','costs']
wdb.RealTimeHist(filter, target)
