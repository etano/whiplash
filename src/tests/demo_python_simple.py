import sys,os,json,tempfile,threading
from subprocess import Popen, PIPE
import whiplashdb

# Make WhiplashDB instance
wdb = whiplashdb.wdb("localhost:27017","test","test")

# Fetch models
print 'Commit model'
model_id = wdb.CommitModel('108ising.json')

# Register solver
print 'Registering solver'
executable = {'class':'ising','owner':'ebrown','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'./apps/test.static','name':'test'}
executable_id = wdb.CommitExecutable(executable)

# NOTE: Packaged executables (SA, SQA, UE) take JSON input and give JSON output though in general user is free to do this how they please

# Form property requests and resolve them on local solver, all asynchronously
print 'Form property requests, resolve them, and push them to the database (ASYNCHRONOUS)'
def Resolve(model_id,executable_id,n_reps):
    property = {'class':'ising','owner':'ebrown','executable_id':executable_id,'model_id':model_id,'status':3,'params':{'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8'}}
    model = wdb.FetchModel(model_id)
    executable = wdb.FetchExecutable(executable_id)
    for i in range(n_reps):
        # Set unique seed
        property['seed'] = i

        # Write JSON file
        f = tempfile.NamedTemporaryFile(delete=False)
        f.write(json.dumps({'property':property,'model':model}))
        f.close()

        # Run solver
        env = os.environ.copy()
        p = Popen([executable['path'],f.name],stdout=PIPE,stderr=PIPE,env=env)
        (stdout,stderr) =  p.communicate()

        # Commit back to database
        wdb.CommitProperty(json.loads(stdout))
thr = threading.Thread(target=Resolve,args=(model_id,executable_id,1000),kwargs={})
thr.start()

# Query and update plot continuously
print 'Query for resulting costs and plot'
filter = {'class':'ising','owner':'ebrown'}
target = ['cfg','costs']
wdb.RealTimeHist(filter, target)
