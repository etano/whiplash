# Usage

Below we provide some basic instructions on how to interact with the [WhiplashDB](http://whiplash.ethz.ch) framework. Please note, however, that specific usage instructions can depend on the type of the deployment used.

Most interaction with [WhiplashDB](http://whiplash.ethz.ch) will be through the provided Python module. Since currently we rely on [MongoDB](http://mongodb.org), the [PyMongo](https://api.mongodb.org/python/current/) python module is required.

To connect to an instance of [WhiplashDB](http://whiplash.ethz.ch), simply do the following:

    import whiplashdb
    wdb = whiplashdb.wdb("localhost:27017","user","pass")

In this example, `localhost:27017` is the address of the framework, `user` is a username, and `pass` is the corresponding password.

## Querying

Querying is just as intuitive as it is to query a normal [MongoDB](http://mongodb.org) database. In fact it's currently exactly the same with the caveat that we purposefully abstract away the collection specification in order to impose the [WhiplashDB](http://whiplash.ethz.ch) schema.

### Models

To query for models, you only need to compose a json filter:

    model_filter = {'class':'ising','params.lattice_type':'random','params.coupling_type':'gaussian'}
    model_ids = wdb.QueryModels(model_filter)

The result of the query is a tuple of model ids. To later fetch a specific model based on the `_id`, use:

    model = wdb.FetchModel(model_id)

### Executables

Querying executables is the same as for models, only the relevant filter fields are different:

    executable_filter = {'class':'ising','algorithm':'SA','schedule':'linear'}
    executable_ids = wdb.QueryExecutables(executable_filter)

Individual executables can also be fetched in the same way:

    executable = wdb.FetchExecutable(executable_id)

Again the result is a json object, representing the executable.

### Properties

Finally properties are queried and fetched in exactly the same way:

    property_filter = {'class':'ising','status':3}
    property_ids = wdb.QueryProperties(property_filter)
    property = wdb.FetchProperty(property_id[0])

Though `properties` can also be formed automatically given `model`, `executable`, and `params` object:

    params = {'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8'}
    property = wdb.FormProperty(model,executable,params)

## Committing

Committing objects to the framework is just as easy as querying. Simply pass in a json object, and the Python module will verify it for correctness, sign it, and post it to the database.

All commit commands can accept json files as input:

    model_id = wdb.CommitModel('108ising.json')

They can also accept python dictionary objects:

    executable = {'class':'ising','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'./apps/test.static','name':'test'}
    executable_id = wdb.CommitExecutable(executable)

If committing many objects at once, it is best to use bulk write commands (specified simply by the plural of each object type):

    property_ids = wdb.CommitProperties(properties)

## Full examples

Here we provide a full example demo script for each possible deployment. For more information on setting up the various deploments, see [deployment](deployment).

### remote.all

This script first commits a model to the remotely hosted framework. It then queries for an executable that already lives on the remote server. Next it commits many unresolved properties, which triggers the remote scheduler to distribute work. Finally we are able to plot results of a query in real-time since the jobs are being run asynchronously.

    import whiplashdb
    
    # Connect to remote WhiplashDB instance
    wdb = whiplashdb.wdb("whiplash.ethz.ch:27017","user","password")
    
    # Committing model
    model_id = wdb.CommitModel('108ising.json')
    
    # Query for executable
    executable_filter = {'class':'ising','algorithm':'SA','name':'an_ss_ge_fi_vdeg'}
    executable_id = wdb.QueryExecutables(executable_filter)[0]
    
    # Commit properties
    params = {'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8'}
    status = 0 # commit properites as unresolved
    n_reps = 10000 # number of repetitions
    properties = [wdb.FormProperty('ising',model_id,executable_id,status,params) for i in range(n_reps)]
    wdb.CommitProperties(properties)
    
    # Scheduler is triggered remotely
    
    # Query and update plot continuously
    filter = {'class':'ising'}
    target = ['cfg','costs']
    wdb.RealTimeHist(filter, target)

### local.all

This script first queries for models from the locally hosted framework. It then queries for an executable that already lives on the local server. Next it commits many unresolved properties, which triggers the local scheduler to distribute work. Finally we are able to plot results of a query in real-time since the jobs are being run asynchronously.

    import whiplashdb
    
    # Connect to local WhiplashDB instance
    wdb = whiplashdb.wdb("localhost:27017","user","password")
    
    # Query for models
    model_filter = {'class':'ising','coupling_type':'gaussian'}
    model_ids = wdb.QueryModels(model_filter)
    
    # Query for executable
    executable_filter = {'class':'ising','algorithm':'SA','name':'an_ss_ge_fi_vdeg'}
    executable_id = wdb.QueryExecutables(executable_filter)[0]
    
    # Commit properties
    params = {'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8'}
    status = 0 # commit properites as unresolved
    properties = [wdb.FormProperty('ising',model_id,executable_id,status,params) for model_id in model_ids]
    wdb.CommitProperties(properties)
    
    # Scheduler is triggered locally
    
    # Query and update plot continuously
    filter = {'class':'ising'}
    target = ['cfg','costs']
    wdb.RealTimeHist(filter, target)

NOTE: This assumes the local scheduler is already running.

### local.scheduler

This script first queries for models from the locally hosted framework. It then registers an executable that already lives on the local server. Next it commits many unresolved properties, which triggers the local scheduler to distribute work. Finally we are able to plot results of a query in real-time since the jobs are being run asynchronously.

    import whiplashdb
    
    # Connect to remote WhiplashDB instance
    wdb = whiplashdb.wdb("whiplash.ethz.ch:27017","user","password")
    
    # Query for models
    model_filter = {'class':'ising','coupling_type':'gaussian'}
    model_ids = wdb.QueryModels(model_filter)
    
    # Commit executable
    executable = {'class':'ising','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'./apps/test.static','name':'test'}
    executable_id = wdb.CommitExecutable(executable)
    
    # Commit properties
    params = {'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8'}
    status = 0 # commit properites as unresolved
    properties = [wdb.FormProperty('ising',model_id,executable_id,status,params) for model_id in model_ids]
    wdb.CommitProperties(properties)
    
    # Scheduler is triggered locally
    
    # Query and update plot continuously
    filter = {'class':'ising'}
    target = ['cfg','costs']
    wdb.RealTimeHist(filter, target)

NOTE: This assumes the local scheduler is already running.

### manual.scheduler

This script first commits a model and local executable to the remote framework. Then it locally forms the property json and passes it to the executable along with the model json. After 100 repetitions the resultant properties are commited back to the database. Only afterwards, we can query and plot the results.

    import os,json,tempfile,time
    from subprocess import Popen, PIPE
    import whiplashdb
    
    # Make WhiplashDB instance
    wdb = whiplashdb.wdb("whiplash.ethz.ch:27017","test","test")
    
    # Commit model
    model_id = wdb.CommitModel('108ising.json')
    
    # Commit executable
    executable = {'class':'ising','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'./apps/test.static','name':'test'}
    executable_id = wdb.CommitExecutable(executable)
    
    #
    # NOTE: Packaged executables take JSON input and give JSON output though in general user is free to do this how they please
    #
    # Form property requests and resolve them on local solver
    model = wdb.FetchModel(model_id)
    executable = wdb.FetchExecutable(executable_id)
    params = {'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8'}
    status = 3 # start with status as resolved
    property = wdb.FormProperty('ising',model_id,executable_id,status,params)
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
    
    # Commit properties
    wdb.CommitProperties(properties)
    
    # Query and update plot continuously
    filter = {'class':'ising'}
    target = ['cfg','costs']
    wdb.RealTimeHist(filter, target)

### Example model input

This is the example model __108ising.json__:

    {"class" : "ising", "cfg" : { "n_spins" : 108, "edges" : [ [ [ 0, 1 ], 1.0 ], [ [ 0, 2 ], 1.0 ], [ [ 0, 3 ], -1.0 ], [ [ 0, 4 ], -1.0 ], [ [ 2, 5 ], 1.0 ], [ [ 3, 6 ], -1.0 ], [ [ 4, 7 ], -1.0 ], [ [ 1, 8 ], 1.0 ], [ [ 2, 8 ], -1.0 ], [ [ 3, 8 ], 1.0 ], [ [ 4, 8 ], 1.0 ], [ [ 8, 9 ], -1.0 ], [ [ 9, 10 ], 1.0 ], [ [ 9, 11 ], 1.0 ], [ [ 9, 12 ], 1.0 ], [ [ 9, 13 ], 1.0 ], [ [ 9, 14 ], -1.0 ], [ [ 1, 15 ], 1.0 ], [ [ 2, 15 ], 1.0 ], [ [ 3, 15 ], -1.0 ], [ [ 4, 15 ], -1.0 ], [ [ 15, 16 ], 1.0 ], [ [ 10, 16 ], 1.0 ], [ [ 11, 16 ], 1.0 ], [ [ 12, 16 ], 1.0 ], [ [ 13, 16 ], -1.0 ], [ [ 16, 17 ], -1.0 ], [ [ 1, 18 ], -1.0 ], [ [ 2, 18 ], -1.0 ], [ [ 3, 18 ], 1.0 ], [ [ 4, 18 ], -1.0 ], [ [ 18, 19 ], -1.0 ], [ [ 10, 19 ], 1.0 ], [ [ 11, 19 ], 1.0 ], [ [ 12, 19 ], -1.0 ], [ [ 13, 19 ], 1.0 ], [ [ 19, 20 ], 1.0 ], [ [ 5, 21 ], 1.0 ], [ [ 6, 22 ], 1.0 ], [ [ 7, 23 ], 1.0 ], [ [ 5, 24 ], 1.0 ], [ [ 6, 24 ], 1.0 ], [ [ 7, 24 ], 1.0 ], [ [ 24, 25 ], -1.0 ], [ [ 25, 26 ], -1.0 ], [ [ 25, 27 ], -1.0 ], [ [ 25, 28 ], 1.0 ], [ [ 25, 29 ], 1.0 ], [ [ 25, 30 ], 1.0 ], [ [ 5, 31 ], 1.0 ], [ [ 6, 31 ], -1.0 ], [ [ 7, 31 ], 1.0 ], [ [ 31, 32 ], -1.0 ], [ [ 26, 32 ], 1.0 ], [ [ 27, 32 ], 1.0 ], [ [ 28, 32 ], 1.0 ], [ [ 29, 32 ], 1.0 ], [ [ 32, 33 ], 1.0 ], [ [ 23, 34 ], -1.0 ], [ [ 21, 35 ], -1.0 ], [ [ 22, 35 ], 1.0 ], [ [ 23, 35 ], -1.0 ], [ [ 35, 36 ], -1.0 ], [ [ 36, 37 ], 1.0 ], [ [ 36, 38 ], -1.0 ], [ [ 36, 39 ], -1.0 ], [ [ 36, 40 ], -1.0 ], [ [ 36, 41 ], 1.0 ], [ [ 21, 42 ], -1.0 ], [ [ 22, 42 ], 1.0 ], [ [ 23, 42 ], -1.0 ], [ [ 42, 43 ], -1.0 ], [ [ 37, 43 ], 1.0 ], [ [ 38, 43 ], -1.0 ], [ [ 39, 43 ], -1.0 ], [ [ 40, 43 ], -1.0 ], [ [ 43, 44 ], -1.0 ], [ [ 21, 45 ], 1.0 ], [ [ 22, 45 ], -1.0 ], [ [ 23, 45 ], 1.0 ], [ [ 45, 46 ], 1.0 ], [ [ 37, 46 ], -1.0 ], [ [ 38, 46 ], 1.0 ], [ [ 39, 46 ], 1.0 ], [ [ 40, 46 ], 1.0 ], [ [ 46, 47 ], -1.0 ], [ [ 21, 48 ], 1.0 ], [ [ 22, 48 ], -1.0 ], [ [ 23, 48 ], -1.0 ], [ [ 48, 49 ], 1.0 ], [ [ 37, 49 ], 1.0 ], [ [ 38, 49 ], 1.0 ], [ [ 39, 49 ], -1.0 ], [ [ 40, 49 ], -1.0 ], [ [ 49, 50 ], -1.0 ], [ [ 34, 51 ], -1.0 ], [ [ 51, 52 ], -1.0 ], [ [ 52, 53 ], -1.0 ], [ [ 52, 54 ], 1.0 ], [ [ 52, 55 ], -1.0 ], [ [ 52, 56 ], -1.0 ], [ [ 34, 57 ], -1.0 ], [ [ 57, 58 ], 1.0 ], [ [ 53, 58 ], -1.0 ], [ [ 54, 58 ], -1.0 ], [ [ 55, 58 ], 1.0 ], [ [ 56, 58 ], -1.0 ], [ [ 34, 59 ], 1.0 ], [ [ 10, 26 ], 1.0 ], [ [ 11, 27 ], -1.0 ], [ [ 12, 28 ], -1.0 ], [ [ 13, 29 ], -1.0 ], [ [ 14, 60 ], 1.0 ], [ [ 14, 61 ], -1.0 ], [ [ 14, 62 ], -1.0 ], [ [ 14, 63 ], 1.0 ], [ [ 17, 60 ], 1.0 ], [ [ 17, 61 ], -1.0 ], [ [ 17, 62 ], 1.0 ], [ [ 17, 64 ], -1.0 ], [ [ 20, 60 ], 1.0 ], [ [ 20, 61 ], -1.0 ], [ [ 20, 62 ], 1.0 ], [ [ 26, 37 ], 1.0 ], [ [ 27, 38 ], -1.0 ], [ [ 28, 39 ], 1.0 ], [ [ 29, 40 ], 1.0 ], [ [ 30, 65 ], 1.0 ], [ [ 30, 66 ], 1.0 ], [ [ 30, 67 ], 1.0 ], [ [ 30, 68 ], 1.0 ], [ [ 30, 69 ], 1.0 ], [ [ 26, 70 ], 1.0 ], [ [ 27, 70 ], -1.0 ], [ [ 28, 70 ], -1.0 ], [ [ 29, 70 ], -1.0 ], [ [ 70, 71 ], 1.0 ], [ [ 65, 71 ], 1.0 ], [ [ 66, 71 ], -1.0 ], [ [ 67, 71 ], -1.0 ], [ [ 68, 71 ], 1.0 ], [ [ 71, 72 ], 1.0 ], [ [ 33, 65 ], 1.0 ], [ [ 33, 66 ], 1.0 ], [ [ 33, 67 ], -1.0 ], [ [ 33, 68 ], 1.0 ], [ [ 33, 73 ], -1.0 ], [ [ 26, 74 ], 1.0 ], [ [ 27, 74 ], 1.0 ], [ [ 28, 74 ], 1.0 ], [ [ 29, 74 ], -1.0 ], [ [ 74, 75 ], -1.0 ], [ [ 65, 75 ], -1.0 ], [ [ 66, 75 ], -1.0 ], [ [ 67, 75 ], 1.0 ], [ [ 68, 75 ], 1.0 ], [ [ 75, 76 ], -1.0 ], [ [ 37, 53 ], 1.0 ], [ [ 38, 54 ], -1.0 ], [ [ 39, 55 ], 1.0 ], [ [ 40, 56 ], 1.0 ], [ [ 41, 77 ], 1.0 ], [ [ 41, 78 ], -1.0 ], [ [ 41, 79 ], 1.0 ], [ [ 41, 80 ], -1.0 ], [ [ 41, 81 ], 1.0 ], [ [ 44, 77 ], -1.0 ], [ [ 44, 78 ], -1.0 ], [ [ 44, 79 ], 1.0 ], [ [ 44, 80 ], -1.0 ], [ [ 44, 82 ], -1.0 ], [ [ 47, 77 ], -1.0 ], [ [ 47, 78 ], 1.0 ], [ [ 47, 79 ], 1.0 ], [ [ 47, 80 ], -1.0 ], [ [ 47, 83 ], -1.0 ], [ [ 50, 77 ], -1.0 ], [ [ 50, 78 ], -1.0 ], [ [ 50, 79 ], 1.0 ], [ [ 50, 80 ], 1.0 ], [ [ 50, 84 ], -1.0 ], [ [ 53, 85 ], -1.0 ], [ [ 54, 85 ], 1.0 ], [ [ 55, 85 ], 1.0 ], [ [ 56, 85 ], 1.0 ], [ [ 85, 86 ], 1.0 ], [ [ 86, 87 ], 1.0 ], [ [ 86, 88 ], -1.0 ], [ [ 86, 89 ], 1.0 ], [ [ 86, 90 ], -1.0 ], [ [ 86, 91 ], -1.0 ], [ [ 60, 92 ], -1.0 ], [ [ 61, 92 ], -1.0 ], [ [ 62, 92 ], 1.0 ], [ [ 92, 93 ], -1.0 ], [ [ 60, 65 ], -1.0 ], [ [ 61, 66 ], 1.0 ], [ [ 62, 67 ], 1.0 ], [ [ 93, 94 ], -1.0 ], [ [ 93, 95 ], 1.0 ], [ [ 93, 96 ], 1.0 ], [ [ 93, 97 ], 1.0 ], [ [ 63, 94 ], 1.0 ], [ [ 63, 95 ], 1.0 ], [ [ 63, 96 ], -1.0 ], [ [ 63, 97 ], -1.0 ], [ [ 64, 94 ], -1.0 ], [ [ 64, 95 ], 1.0 ], [ [ 64, 96 ], -1.0 ], [ [ 64, 97 ], -1.0 ], [ [ 65, 77 ], -1.0 ], [ [ 66, 78 ], 1.0 ], [ [ 67, 80 ], -1.0 ], [ [ 68, 79 ], -1.0 ], [ [ 69, 98 ], -1.0 ], [ [ 69, 99 ], 1.0 ], [ [ 69, 100 ], 1.0 ], [ [ 72, 98 ], 1.0 ], [ [ 72, 99 ], 1.0 ], [ [ 72, 100 ], 1.0 ], [ [ 73, 98 ], -1.0 ], [ [ 73, 99 ], 1.0 ], [ [ 73, 100 ], -1.0 ], [ [ 76, 98 ], 1.0 ], [ [ 76, 99 ], -1.0 ], [ [ 76, 100 ], 1.0 ], [ [ 77, 87 ], -1.0 ], [ [ 78, 88 ], -1.0 ], [ [ 79, 89 ], 1.0 ], [ [ 80, 90 ], -1.0 ], [ [ 81, 101 ], 1.0 ], [ [ 81, 102 ], -1.0 ], [ [ 81, 103 ], -1.0 ], [ [ 82, 101 ], 1.0 ], [ [ 82, 102 ], -1.0 ], [ [ 82, 103 ], 1.0 ], [ [ 83, 101 ], -1.0 ], [ [ 83, 102 ], 1.0 ], [ [ 83, 103 ], -1.0 ], [ [ 84, 101 ], -1.0 ], [ [ 84, 102 ], 1.0 ], [ [ 84, 103 ], -1.0 ], [ [ 91, 104 ], 1.0 ], [ [ 91, 105 ], 1.0 ], [ [ 91, 106 ], -1.0 ], [ [ 94, 98 ], 1.0 ], [ [ 95, 99 ], 1.0 ], [ [ 96, 100 ], 1.0 ], [ [ 98, 101 ], -1.0 ], [ [ 99, 102 ], -1.0 ], [ [ 101, 104 ], -1.0 ], [ [ 102, 105 ], -1.0 ], [ [ 104, 107 ], 1.0 ], [ [ 105, 107 ], 1.0 ], [ [ 106, 107 ], 1.0 ] ] }}
