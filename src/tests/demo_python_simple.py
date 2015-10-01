import sys,os,json,tempfile,time
from subprocess import Popen, PIPE
import whiplashdb

# Make WhiplashDB instance
wdb = whiplashdb.wdb("localhost:27017","test","test")

# Fetch models
model_id = wdb.CommitModel('108ising.json')

# Register solver
executable = {'class':'ising','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'./apps/test.static','name':'test'}
executable_id = wdb.CommitExecutable(executable)

# NOTE: Packaged executables (SA, SQA, UE) take JSON input and give JSON output though in general user is free to do this how they please
# Form property requests and resolve them on local solver
model = wdb.FetchModel(model_id)
executable = wdb.FetchExecutable(executable_id)
params = {'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8'}
property = wdb.FormProperty(model,executable,params)
properties = []
for i in range(100):
     # Set unique seed
     property['seed'] = i

     # Write JSON file
     f = tempfile.NamedTemporaryFile(delete=False)
     f.write(json.dumps({'property':property,'model':model}))
     f.close()

     # Run solver
     t0 = time.time()
     p = Popen([executable['path'],f.name],stdout=PIPE,stderr=PIPE,env=os.environ.copy())
     (stdout,stderr) = p.communicate()
     t1 = time.time()

     # Record walltime
     property['walltime'] = t1-t0

     # Append property
     properties.append(json.loads(stdout))

# Commit back to database
wdb.CommitProperties(properties)

# Query and update plot continuously
filter = {'class':'ising'}
target = ['cfg','costs']
wdb.RealTimeHist(filter, target)
