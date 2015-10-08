'''Parameter sweep using Whiplash. The parameter sweep is done along
a grid over specified range of number of sweeps, beta0, beta1 and
initial seeds in simulated annealing. Each set of parameters is ran in
parallel as a separate job.

'''

import whiplash
import numpy as np

#start whiplash client
wdb = whiplash.wdb("localhost:27017")

#commit model 
model_id = wdb.CommitModel('src/tests/108ising.json')

#commit executable
executable_id = wdb.CommitExecutable({'class':'ising','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'./apps/spin_glass_solver/bin/main','name':'test'})

#sweep over parameters and make a property for each
n_sweeps = []
ns = 10
while ns < 1e06:
    n_sweeps.append(ns)
    n_sweep *= 1.5

for ns in n_sweeps:
    for b0 in np.linspace(1.0,100.0,100):
        for b1 in np.linspace(0.01,1.0,100):
            for seed in range(100):
                params = {'n_sweeps':ns,'b0':b0,'b1':b1}
                properties.append(wdb.FormProperty('ising',model_id,executable_id,0,seed,params))

#commit all properties
wdb.CommitProperties(properties)

#results can later be collected when all jobs are finished
