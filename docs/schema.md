# Database schema

## Models

- id : unique id
- timestamp : time model was uploaded
- class : name of problem class (ex: "JobShop")
- owner : who created the model instance
- parent_id : if model derived from another model in the database, the id of this parent model (default : "none")
- cfg : 
    - params : user defined traits
    - ... : problem specific traits (e.g. # spins, the Hamiltonian, etc. See [problem class standards](#problem-class-standards))

## Executables

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

## Properties

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

## Machines

- id : unique id
- name : machine name
- environment (optional): software environment
- spec (optional): hardware configuration
