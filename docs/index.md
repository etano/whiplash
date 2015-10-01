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

## Setup

### Installation

Currently installation is as simple as

    git clone git@gitlab.phys.ethz.ch:zintchenko/whiplashdb.git
    cd whiplashdb
    source autogen.sh

This will download, compile, and install libbson, mongoc, libbsonxx,
and mongocxx.

To build all currently integrated solvers do

    cd src/apps
    source build_apps.sh

The server should in addition be running an instance of the MongoDB
daemon which is using the database file. MongoDB can be obtained at
https://www.mongodb.org

### Deployment

Current deployment is limited to the Mönch cluster located at
monch.cscs.ch.

Future deployment types will include completely local, dockerized, and
remote clusters.

An instance of the database and the scheduler should be running on the
server. The scheduler can be started by calling
./bin/drivers/scheduler.driver

## Populating the framework

Currently all models, executables, and properties are loaded into
WhiplashDB through our CLI. All drivers for the CLI are located in the
bin/drivers directory. See below for details for the specific
requirements of each.

## Demos

A convenient way to communitate with the database is using python. A
python demo can be found in
$(whiplash_root)/src/tests/demo_python.py. The pymongo
(https://api.mongodb.org/python/current/) python module is required.

#### Loading models

Driver: commit_model.driver

Required arguments:

    -file FILENAME : the path to the model file
    -class PROBLEM_CLASS : the name of the model problem class
    -owner USER : user name of the model uploader

Optional arguments:

    -parent_id PARENT_ID : unique id of parent model
    -KEY VALUE : both key and value are specified by the user

Example:

    ./commit_model.driver -file apps/108problem.lat -class
    ising -owner akosenko -parent_id 8 -type quantum_speedup

#### Loading executables

Driver: commit_executable.driver

Required arguments:

    -file FILENAME : the path to the executable file
    -class PROBLEM_CLASS : the name of the model problem class
    -owner USER : user name of the model uploader
    -description : brief description of the executable
    -algorithm : specification of the algorithm used
    -version : version number of the executable
    -build : special build flags used to compile the executable

Optional arguments:

    -KEY VALUE : both key and value are specified by the user

Example:

    ./commit_executable.driver -file apps/test.app -class
    ising -owner akosenko -description "This solver simply chooses
    random configurations and returns the lowest energy found"
    -algorithm "random" -version "1.0" -build "O3" -purpose "testing"

#### Loading properties

Driver: commit_property.driver

Required arguments:

    -class PROBLEM_CLASS : the name of the model problem class
    -owner USER : user name of the model uploader
    -model MODEL_ID : unique id of the model to be solved
    -executable EXECUTABLE_ID : unique id of the executable used to solve the model

Optional arguments:

    -KEY VALUE : both key and value are specified by the user

Example:

    ./commit_property.driver -class ising -owner akosenko -model 0
    -executable 0 -Nr 7

#### Format the current instance of the database

Driver: format_db.driver

Required argument: None

Optional argument: None

Example:

    ./format_db.driver

## Querying

On the surface, querying an executable database appears similar to
querying a normal database. Here's an example in C++:

    #include "wdb.hpp"
    using wdb::odb::mongo::objectdb;
    using wdb::deployment::basic;

    int main(int argc, char* argv[]){
        // Initialize database and deployment
        objectdb db("cwave.ethz.ch:27017");
        basic deployment(db);

        // Create query object
        basic::object filter;
        basic::writer::prop("class", std::string("ising")) >> filter;

        // Query and print results
        for(const auto& result : deployment.query( filter, std::tie("cfg", "cost") ))
            std::cout << basic::reader::read<double>(*result, std::tie("cfg","cost") ) << std::endl;

        return 0;
    }

Notice we first create a filter on which to query, here all properties
with class "ising". Next we define which target we would like to
return, here "cost". Finally, we print out the results. Clearly one
does the same with a normal database.

The difference lies in the query function itself. If WhiplashDB finds
that the "cost" of any property of class "ising" is not yet computed,
it will automatically know how to compute it. It does so by using the
property's linked executable to operate on the property's linked
model.

## Database schema

### Models

- id : unique id
- timestamp : time model was uploaded
- class : name of problem class (ex: "JobShop")
- owner : who created the model instance
- parent_id : if model derived from another model in the database, the id of this parent model (default : "none")
- cfg : 
    - params : user defined traits
    - ... : problem specific traits (e.g. # spins, the Hamiltonian, etc. See [problem class standards](#problem-class-standards))

### Executables

- id : unique id
- timestamp : time executable was uploaded
- class : the problem class name on which the executable executes
- owner : who created the model instance
- location : where the executable is stored (this may depend on the machine!)
- description : a description of what the executable does/is capable of
- version : version of the executable
- build_info : specification of how executable was built
- algorithm : the algorithm that is being executed
- cfg : traits of the executable (e.g. annealing schedule, etc. See [algorithm standards](#algorithm-standards))
  
### Properties

- id : unique id
- timestamp : time property was uploaded
- class : the problem class name on which the executable executes and model describes
- owner : who submitted the property
- model_id : id of the associated model
- executable_id : id of the associated executable
- walltime : time it took to solve
- status : whether or not property is resolved
- seed : randomly generated integer to use as random seed
- cfg : 
    - params : 
        - ... : property specific traits (e.g. #sweeps, machine_id, etc.)
    - ... : problem class output (e.g. cost, final state, etc. See [problem class standards](#problem-class-standards)) 

### Machines

- id : unique id
- name : machine name
- environment (optional): software environment
- spec (optional): hardware configuration

## Problem class standards

### TSP

#### Model input format

    # comments
    coordinate_1_1 coordinate_1_2 ... coordinate_1_d
    coordinate_2_1 ...
    ...

#### Property configuration parameters

##### Determined from input

- n_cities : number of cities
- edges : definition of the TSP

##### Computed

- route : array of numbers corresponding to each coordinate
- length : total length of the route

### SAT

#### Model input format

In Weighted Partial Max-SAT, the parameters line is "p wcnf nbvar
nbclauses top". We associate a weight with each clause, wich is the
first integer in the clause. Weights must be greater than or equal to
1, and the sum of all soft clauses smaller than 263. Hard clauses have
weigtht top and soft clauses have a weight smaller than top. We assure
that top is a weight always greater than the sum of the weights of
violated soft clauses.

Example of Weighted Partial Max-SAT formula:

    c
    c comments Weighted Partial Max-SAT
    c
    p wcnf 4 5 16
    16 1 -2 4 0
    16 -1 -2 3 0
    8 -2 -4 0
    4 -3 2 0
    3 1 3 0

#### Property configuration parameters

##### Determined from input

- n_variables : number of variables
- n_clauses : number of clauses
- clauses : representation of SAT problem

##### Computed

- variables : array of binary variables
- cost : total weight of SAT clauses
- sat : binary saying SAT or un-SAT

### Ising

#### Model input file format

    # comments
    spin_1 spin_2 ... coupling_a
    spin_1 spin_3 spin_9 ... coupling_b
    ...
    
#### Property configuration parameters

##### Determined from input

- n_spins : number of Ising spins
- edges : definition of the Ising Hamiltonian
- lattice : type of lattice ("chain","square","cubic","chimera","all_to_all",...)
- coupling_type : distribution of couplings ("gaussian","uniform","isotropic",...)

##### Computed

- cost : total cost of final spin configuration
- spins : final configuration of spins

## Algorithm standards

### Simulated annealing (SA)

#### Property configuration parameters

- n_sweeps : number of Monte Carlo sweeps
- T_0 : initial temperature
- T_1 : final temperature

#### Executable configuration parameters

- schedule : annealing schedule ("linear", "inverse", "quadratic", or "custom")

### Simulated quantum annealing with path integral QMC (SQA-PIMC)

#### Property configuration parameters

- n_sweeps : number of Monte Carlo sweeps
- M : number of time steps
- beta : inverse temperature
- gamma_0 : initial coefficient of transverse field
- gamma_1 : final coefficient of transverse field

#### Executable configuration parameters

- schedule : annealing schedule ("linear", "inverse", "quadratic", or "custom")

### Simulated quantum annealing with path integral ground state QMC (SQA-PIGS)

#### Property configuration parameters

- n_sweeps : number of Monte Carlo sweeps
- M : number of time step projections
- beta : final projection temperature
- gamma_0 : initial coefficient of transverse field
- gamma_1 : final coefficient of transverse field

#### Executable configuration parameters

- schedule : annealing schedule ("linear", "inverse", "quadratic", or "custom")

### Simulated quantum annealing with unitary evolution (SQA-U)

#### Property configuration parameters

- M : number of time step projections
- T : total projection time
- gamma_0 : initial coefficient of transverse field
- gamma_1 : final coefficient of transverse field

#### Executable configuration parameters

- schedule : annealing schedule ("linear", "inverse", "quadratic", or "custom")

ALGORITHMS

A number of algorithms are already implemented in whiplashDB. The
algorithms can be found in $(whiplash_root)/src/apps

* DT-SQA: discrete-time simulated quantum annealing code

* anc: a set of optimised simulated annealing codes

* unitary_evolution: unitary evolution code

* spin_glass_solver: a general spin-glass solver

* XXcode: quantum annealing code which includes XX couplings
