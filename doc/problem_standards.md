# TSP

## Input
    # comments
    cityA cityB distance
    ...
    
## Output

# SAT

## Input

Weigthed Partial Max-SAT input format

In Weigthed Partial Max-SAT, the parameters line is "p wcnf nbvar
nbclauses top". We associate a weight with each clause, wich is the
first integer in the clause. Weigths must be greater than or equal to
1, and the sum of all soft clauses smaller than 263. Hard clauses have
weigth top and soft clauses have a weigth smaller than top. We assure
that top is a weight always greater than the sum of the weights of
violated soft clauses.

Example of Weigthed Partial Max-SAT formula:

c
c comments Weigthed Partial Max-SAT
c
p wcnf 4 5 16
16 1 -2 4 0
16 -1 -2 3 0
8 -2 -4 0
4 -3 2 0
3 1 3 0

## Output

# QUBO/Ising

## Input
    # comments
    coupling siteA siteB ...
    ...

## Output

# Job shop scheduling

## Input
## Output

# Graph isomorphism

## Input
## Output