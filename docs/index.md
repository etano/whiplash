WhiplashDB
==========

WhiplashDB is a framework to run large numbers of simulations in a
distributed environment. It aims to maximise efficiency, convenience
and reproducibility by storing inputs and outputs of each simulation
in a database, handling direct interaction with clusters and queing of
jobs, and providing a convenient interface to submit jobs and analyse
output.

The framework is based on the MongoDB NoSQL database and includes a
library of problem classes as well as job scheduling and statistical
analysis interfaces. WhiplashDB is an executable database, meaning
results to queries can be computed on the fly (see the
[Querying](#querying) section for more information).

Each job is composed of three components: a model, an executable and a
property

* model: a problem instance which serves as an input to an
  executeble.

* property: job description passed on to the executable, including
  input parameters, specification of the model, etc. When a job
  succesfully finishes, it appends its output to the property with
  which it was called.

* executable: the binary executed by the job.

## Deployments

Current deployment is limited to the Mönch cluster located at
monch.cscs.ch.

Future deployment types will include completely local, dockerized, and
remote clusters.

An instance of the database and the scheduler should be running on the
server. The scheduler can be started by calling
./bin/drivers/scheduler.driver


