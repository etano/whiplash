# Standards

Below we list all required fields for [WhiplashDB](http://whiplash.ethz.ch) data objects.

## Common standards

These fields are common to all objects.

- `_id `: unique id (automatically provided)
- `timestamp `: time committed (automatically provided)
- `owner `: user who committed the object (automatically provided)
- `class `: name of problem class (ex: "Ising")

### Models

These fields are common to all models.

- `parent_id` : if model derived from another model in the database, the id of this parent model (default : "none")
- `cfg` :
    - `...` : problem specific traits (e.g. n_spins, the Hamiltonian, etc. See [problem class standards](#problem-class-standards))
- `params` :
    - `...` : user defined traits

### Executables

These fields are common to all executables.

- `name` : name of the executable
- `location` : where the executable is stored (this may depend on the machine!)
- `description` : a description of what the executable does/is capable of
- `version` : version of the executable
- `build` : specification of how executable was built
- `algorithm` : the algorithm that is being executed
- `cfg` :
    - `...` : algorithm specific traits (e.g. annealing schedule, etc. See [algorithm standards](#algorithm-standards))
- `params` :
    - `...` : user defined traits

### Properties

These fields are common to all properties.

- `model_id` : id of the associated model
- `executable_id` : id of the associated executable
- `walltime` : time it took to solve
- `status` : whether or not property is resolved
- `seed` : randomly generated integer to use as random seed
- `cfg` :
    - `...` : problem class output (e.g. cost, final state, etc. See [problem class standards](#problem-class-standards))
- `params` :
    - `...` : property specific traits (e.g. n_sweeps, machine_id, etc.)

## Problem class standards

Below we list fields that are required and computed for specific problem classes. These will reside in the `cfg` section of the generic object.

### Ising

General spin systems

#### Model

- `n_spins` : number of Ising spins
- `edges` : definition of the Ising Hamiltonian
- `lattice` : type of lattice ("chain","square","cubic","chimera","all_to_all",...)
- `coupling_type` : distribution of couplings ("gaussian","uniform","isotropic",...)

#### Property

- `costs` : vector of total costs of final spin configurations
- `spin_cfgs` : vector of final configurations of spins

### TSP

Travelling salesman problems

#### Model

- `n_cities` : number of cities
- `coordinates` : definition of the TSP

#### Property

- `costs` : vector of total lengths of the routes
- `route_cfgs` : vector of route configurations

### SAT

Satisfiability problems

#### Model

- `n_variables` : number of variables
- `n_clauses` : number of clauses
- `clauses` : representation of SAT problem

#### Property

- `costs` : vector of total weights of SAT clauses
- `sats` : vector of binaries representing SAT or un-SAT
- `variable_cfgs` : vector of binary variable configurations

## Algorithm standards

The below fields must be specified for the mentioned algorithms

### SA

Simulated annealing

#### Property

- `n_sweeps` : number of Monte Carlo sweeps
- `T_0` : initial temperature
- `T_1` : final temperature

#### Executable

- `schedule` : annealing schedule ("linear", "inverse", "quadratic", or "custom")

### SQA-PIMC

Simulated quantum annealing with path integral QMC

#### Property

- `n_sweeps` : number of Monte Carlo sweeps
- `M` : number of time steps
- `beta` : inverse temperature
- `gamma_0` : initial coefficient of transverse field
- `gamma_1` : final coefficient of transverse field

#### Executable

- `schedule` : annealing schedule ("linear", "inverse", "quadratic", or "custom")

### SQA-PIGS

Simulated quantum annealing with path integral ground state QMC

#### Property

- `n_sweeps` : number of Monte Carlo sweeps
- `M` : number of time step projections
- `beta` : final projection temperature
- `gamma_0` : initial coefficient of transverse field
- `gamma_1` : final coefficient of transverse field

#### Executable

- `schedule` : annealing schedule ("linear", "inverse", "quadratic", or "custom")

### SQA-U

Simulated quantum annealing with unitary evolution

#### Property configuration parameters

- `M` : number of time step projections
- `T` : total projection time
- `gamma_0` : initial coefficient of transverse field
- `gamma_1` : final coefficient of transverse field

#### Executable configuration parameters

- `schedule` : annealing schedule ("linear", "inverse", "quadratic", or "custom")
