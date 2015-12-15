# Overview

---

[Whiplash](http://whiplash.ethz.ch) is a simulation framework created
to make high throughput calculations easy in a distributed
environment. It aims to maximise efficiency, convenience and
reproducibility by storing inputs and outputs of each simulation in a
database, handling direct interaction with clusters and providing a
convenient interface to submit jobs and analyse results.

The [Whiplash](http://whiplash.ethz.ch) data schema is comprised of
three components: `models`, `executables`, and `properties`.

`Models` provide all relevant information for a given problem
instance.

`Executables` are binaries that can operate on models.

`Properties` is effectively a job or task description which hold
information that the executables resolve when given models and any
other relevant parameters.