# Algorithm standards

## Simulated annealing (SA)

### Property configuration parameters

- n_sweeps : number of Monte Carlo sweeps
- T_0 : initial temperature
- T_1 : final temperature

### Executable configuration parameters

- schedule : annealing schedule ("linear", "inverse", "quadratic", or "custom")

## Simulated quantum annealing with path integral QMC (SQA-PIMC)

### Property configuration parameters

- n_sweeps : number of Monte Carlo sweeps
- M : number of time steps
- beta : inverse temperature
- gamma_0 : initial coefficient of transverse field
- gamma_1 : final coefficient of transverse field

### Executable configuration parameters

- schedule : annealing schedule ("linear", "inverse", "quadratic", or "custom")

## Simulated quantum annealing with path integral ground state QMC (SQA-PIGS)

### Property configuration parameters

- n_sweeps : number of Monte Carlo sweeps
- M : number of time step projections
- beta : final projection temperature
- gamma_0 : initial coefficient of transverse field
- gamma_1 : final coefficient of transverse field

### Executable configuration parameters

- schedule : annealing schedule ("linear", "inverse", "quadratic", or "custom")

## Simulated quantum annealing with unitary evolution (SQA-U)

### Property configuration parameters

- M : number of time step projections
- T : total projection time
- gamma_0 : initial coefficient of transverse field
- gamma_1 : final coefficient of transverse field

### Executable configuration parameters

- schedule : annealing schedule ("linear", "inverse", "quadratic", or "custom")

ALGORITHMS

A number of algorithms are already implemented in whiplashDB. The
algorithms can be found in $(whiplash_root)/src/apps

* DT-SQA: discrete-time simulated quantum annealing code

* anc: a set of optimised simulated annealing codes

* unitary_evolution: unitary evolution code

* spin_glass_solver: a general spin-glass solver

* XXcode: quantum annealing code which includes XX couplings
