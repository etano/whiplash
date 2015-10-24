# Usage

Below we provide some basic instructions on how to interact with the [Whiplash](http://whiplash.ethz.ch) framework. Please note, however, that specific usage instructions can depend on the type of the deployment used.

Most interaction with [Whiplash](http://whiplash.ethz.ch) will be through the provided Python module. Since currently we rely on [MongoDB](http://mongodb.org), the [PyMongo](https://api.mongodb.org/python/current/) python module is required.

To connect to an instance of [Whiplash](http://whiplash.ethz.ch), simply do the following:

    import whiplash
    wdb = whiplash.wdb("localhost:27017","user","pass")

In this example, `localhost:27017` is the address of the framework, `user` is a username, and `pass` is the corresponding password.

## Querying

Querying is just as intuitive as it is to query a normal [MongoDB](http://mongodb.org) database. In fact it's currently exactly the same with the caveat that we purposefully abstract away the collection specification in order to impose the [Whiplash](http://whiplash.ethz.ch) schema.

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
