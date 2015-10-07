'''Parameter search using WhiplashDB. The search itself is done
sequentially. However, each call to the cost function is very
expensive. Here the cost is the expected complexity of finding the
most optimal configuration for a model. This is computed by running
simulated annealing for random initial states thousands of times. As
the restarts are independent and takes approximately the same time to
complete, they are efficiently fanned out with Whiplash and the
results collected when at least a set fraction is competed. We use the
MOE optimisation library developed by Yelp Research to find optimal
parameters in as few queries to the cost function as possible.

'''

import subprocess,json,whiplashdb,math,random

#start whiplashdb client
wdb = whiplashdb.wdb("localhost:27017")

#commit model 
model_id = wdb.CommitModel('src/tests/108ising.json')

#ground state of the model
cost_opt = -165

#commit executable
executable_id = wdb.CommitExecutable({'class':'ising','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'./apps/spin_glass_solver/bin/main','name':'test'})

#number of repetitions
n_reps = 1000 

#chance of finding optimal config
p_chance = 0.99 

#cost function for our search. here the expected number of sweeps to
#obtain optimal configurationwith probability p_chance.
def func(x):

    #simulation parameters
    params = {'n_sweeps':x[0],'b0':x[1],'b1':x[2]}

    #form property
    properties = [wdb.FormProperty('ising',model_id,executable_id,0,random.randint(0,1<<32),params) for i in range(n_reps)]

    #commit properties
    property_ids = wdb.CommitProperties(properties)

    #commit properties and wait for at least 99% of them to be resolved
    properties = wdb.HoldUntilResolved(property_ids,0.99)

    #calculate number of times a configuration of the optimal cost was found
    num_success = 0
    for property in properties:
        if property['cfg']['costs'] == cost_opt:
            num_success += 1

    #delete properties which are no longer needed
    wdb.DeleteProperties(property_ids)
        
    #success probability
    p_success = float(num_success) / len(property_ids)

    #expected number of sweeps to obtain optimal configuration with probability p_success
    complexity = x[0]*math.log(1.0-p_chance)/math.log(1.0-p_success) #n_sweeps * expected number of repetitions

    return complexity

data = {}

#value ranges for where to search for parameters. here we have 3
data['limits'] = []

#beta0 range
data['limits'].append([0.0,10.0]) 

#beta1 range
data['limits'].append([0.0,10.0]) 

#number of sweeps range
data['limits'].append([0,10000]) 

#noise
data['var'] = 0.01 

data['points'] = []

#first sample point
x0 = [5.0,0.1,1000]
data['points'].append([x0,func(x0)])

json.dump(data, open('experiment.json','w'))

num_samples = 100

#sample num_samples points, expecting each point to be a better guess
#at the optimum that the others
for i in range(num_samples):

    #communicate with the MOE optimisation library through subprocess
    cmd = 'docker exec -it moe sh -c \"cd whiplashdb && python next_point.py\"'

    x = json.loads(subprocess.check_output(cmd, shell=True))
    C = func(x)

    print i,x,C

    #append new point to the data and write to file
    data['points'].append([x,C])
    json.dump(data, open('experiment.json','w'))
