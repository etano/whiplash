# Problem class standards

## TSP

### Model input format

    # comments
    coordinate_1_1 coordinate_1_2 ... coordinate_1_d
    coordinate_2_1 ...
    ...

### Property configuration parameters

#### Determined from input

- n_cities : number of cities
- edges : definition of the TSP

#### Computed

- route : array of numbers corresponding to each coordinate
- length : total length of the route

## SAT

### Model input format

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

### Property configuration parameters

#### Determined from input

- n_variables : number of variables
- n_clauses : number of clauses
- clauses : representation of SAT problem

#### Computed

- variables : array of binary variables
- cost : total weight of SAT clauses
- sat : binary saying SAT or un-SAT

## Ising

### Model input file format

    # comments
    spin_1 spin_2 ... coupling_a
    spin_1 spin_3 spin_9 ... coupling_b
    ...

### Property configuration parameters

#### Determined from input

- n_spins : number of Ising spins
- edges : definition of the Ising Hamiltonian
- lattice : type of lattice ("chain","square","cubic","chimera","all_to_all",...)
- coupling_type : distribution of couplings ("gaussian","uniform","isotropic",...)

#### Computed

- cost : total cost of final spin configuration
- spins : final configuration of spins
