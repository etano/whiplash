# Overview

---

[Whiplash](http://whiplash.ethz.ch) is a simulation framework created to make high throughput calculations easy in a distributed environment. It aims to maximise efficiency, convenience and reproducibility by storing inputs and outputs of each simulation in a database, handling direct interaction with clusters and queueing of jobs, and providing a convenient interface to submit jobs and analyse results.

### Data structure

The [Whiplash](http://whiplash.ethz.ch) data schema is comprised of three components: `models`, `executables`, and `properties`.

`Models` provide all relevant information for a given problem instance. For physical systems this could be a description of the Hamiltonian, while for optimization problems, this could provide the parameters of a cost function.

`Executables` are binaries that can operate on models.

`Properties` hold information that the executables resolve when given models and any other relevant parameters. Before a property is resolved, it can be seen as a job or task description. This description will effectively link models to executables with other given parameters. Once the executable operates on the model, it will store the results in the property that tied them together.

Further details about these three data concepts can be found in [Standards](standards).

### Runtime environment

In order to make scaling to large, distributed systems as easy as possible, [Whiplash](http://whiplash.ethz.ch) comes with its own runtime environment, whose main components are the `scheduler`, `workers`, and `controllers`.

The `scheduler` is a (typically) daemonized process that routinely checks the database to see which (if any) properties need to be resolved. It keeps a constant pool of such properties and distributes them among its `workers`.

Each `worker` comes featured with specific `controllers` that instruct the worker how to resolve the property it was given by the `scheduler`. The root `controller` has the ability to segue the `worker` from one `controller` type to another while keeping relevant data in memory.

Typically the `scheduler` and `worker` will reside together with the database instance, however, it is not necessary.

Futher details about all possible deployments can be found in [Deployment](deployment).

### Problem classes

All the above description applies to generic problems. However, within [Whiplash](http://whiplash.ethz.ch) it is possible to further optimize specific problem classes. Already, several general optimization problems have specific model, executable, property, and controller classes.

Futher details on specific problem classes can be found in [Standards](standards).
