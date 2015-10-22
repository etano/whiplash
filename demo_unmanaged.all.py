import whiplash

# Connect to local Whiplash instance
wdb = whiplash.wdb("whiplash.ethz.ch","1337","1534d75d461100ab696aaac2e800d2ec7c88172d6394b89bfc6566611d1ef99f")

# Query for models
model_filter = {'class':'ising'}
model_ids = wdb.models.query_for_ids(model_filter)
print model_ids

# Query for executable
executable_filter = {'class':'ising','algorithm':'SA','name':'an_ss_ge_fi_vdeg'}
executable_id = wdb.executables.query_for_ids(executable_filter)[0]
print executable_id

# Commit properties
params = {'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8'}
status = 0 # commit properites as unresolved
properties = []
for i in range(len(model_ids)):
    params['seed'] = i
    properties.append({'executable_id':executable_id,'model_id':model_ids[i],'params':params})
print properties
wdb.properties.commit(properties)

# Scheduler is triggered locally

# Query and update plot continuously
#filter = {'class':'ising'}
#target = ['cfg','costs']
#wdb.RealTimeHist(filter, target)
