import whiplashdb

# Make WhiplashDB in_sweepstance
wdb = whiplashdb.wdb("localhost:27017",True)

# Models
print 'Committing models'
model = {'class':'ising','owner':'ebrown','lattice_type':'random','coupling_type':'gaussian','path':'108ising.lat'}
model_ids = wdb.CommitModel(model)
print model_ids

# Query for executable
print 'Fetching executable'
executable_filter = {'class':'ising','algorithm':'SA','name':'spin_glass_solver'}
executable_id = wdb.QueryExecutables(executable_filter)[0]
print executable_id

# Properties
print 'Committing property requests'
property = {'class':'ising','owner':'ebrown','executable':executable_id,'n_sweeps':10,'T_0':10.0,'T_1':1e-8}
property_ids = wdb.CommitProperties(property, model_ids, n_reps=10000)
print property_ids

# Form query
filter = {'class':prob_class}
target = ['cfg','costs']

# Query and update plot continuously
wdb.RealTimeHist(filter, target)
