# Examples

This is a list applications where the performance advantage of
Whiplash brings significant performance advantage over the common
approach

## Parameter sweep

Parameter sweeps are ubiquitous in scientific computing and
reperesents a key application of Whiplash.

In this example we will look at results for simulated annealing with a
given Hamiltonian. The parameter sweep is done along a grid over
specified range of number of sweeps, beta0, beta1 and initial
seeds. Each set of parameters is ran in parallel as a separate
job. This is done as follows:

Connect to Whiplash

    import whiplashdb
    import numpy as np

    wdb = whiplashdb.wdb("localhost:27017")

Commit the model

    model_id = wdb.CommitModel('src/tests/108ising.json')

Commit the executable

    executable_id = wdb.CommitExecutable({'class':'ising','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'./apps/spin_glass_solver/bin/main','name':'test'})

Sweep over parameters and make a property for each

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

Commit all properties

    wdb.CommitProperties(properties)

Results can later be collected when all jobs are finished

## Parameter search

Another major application of Whiplash is in searchin for optimal
hyperparameters to a simulation wrt. a cost function which requires a
large number of independent runs to be performed, like calculating a
median over a set of models and finding a probability from multiple
random restarts.

The search itself is done sequentially. However, each call to the cost
function is very expensive. Here the cost is the expected complexity
of finding the most optimal configuration for a model. This is
computed by running simulated annealing for random initial states
thousands of times. As the restarts are independent and take
approximately the same time to complete, they are efficiently fanned
out with Whiplash and the results collected when at least a set
fraction is competed. We use the MOE library developed by Yelp
Research for finding the optimal hyperparameters with minimum
evaluations of the cost function. At its core it uses a Gaussian
Process model to fit the current sample points and infer the next most
likely sample point.

The MOE library is packaged inside a docker container and should
therefore be ran inside a docker VM. We will first pull the latest
version of the MOE container and run the MOE container while mapping
the whiplashdb directory into the container.

    docker pull yelpmoe/latest 
    docker run -d --name moe -v ${WDB_HOME}:/home/app/MOE/whiplashdb yelpmoe/latest

We will call the library through the following script which we call
*next_point.py*.

Load data points from file

    import json
    from moe.easy_interface.experiment import Experiment
    from moe.easy_interface.simple_endpoint import gp_next_points
    from moe.optimal_learning.python.data_containers import SamplePoint

    data = json.load(open('experiment.json'))
    var = data['var']

Put data points into *Experiment* object

    exp = Experiment(data['limits'])
    for point in data['points']:
        exp.historical_data.append_sample_points([SamplePoint(point[0], point[1], var)])

Sample next most promising point from Gaussian Process

    print gp_next_points(exp, **{})[0]

The parameter search script is as follows:

Connect to Whiplash

    import subprocess,json,whiplashdb,math,random

    wdb = whiplashdb.wdb("localhost:27017")

Commit model

    model_id = wdb.CommitModel('src/tests/108ising.json')

Set target configuration cost

    cost_opt = -165

Commit an executable

    executable_id = wdb.CommitExecutable({'class':'ising','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'./apps/spin_glass_solver/bin/main','name':'test'})

Set number of repetitions

    n_reps = 1000

Set chance of finding optimal configuration

    p_chance = 0.99

Define the cost function for our search. Here the expected number of
sweeps to obtain optimal configuration with probability p_chance.

    def cost(x):

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
        return x[0]*math.log(1.0-p_chance)/math.log(1.0-p_success)

Set value ranges for where to search for parameters. Here we have three

    data = {}

    data['limits'] = []

Beta0 range

    data['limits'].append([0.0,10.0])

Beta1 range

    data['limits'].append([0.0,10.0])

Number of sweeps range

    data['limits'].append([0,10000])

Noise for the optimisation routine

    data['var'] = 0.01

Set first sample point

    x0 = [5.0,0.1,1000]
    data['points'] = [[x0,cost(x0)]]

We use the file *experiment.json* to pass the sample points to the MOE
optimisation routine.

Write point to experiment 

    json.dump(data, open('experiment.json','w'))

Define number of samples

    num_samples = 100

Sample points, expecting each point to be a better guess at the
optimum that the others

    for i in range(num_samples):

        #communicate with the MOE optimisation library through subprocess
        cmd = 'docker exec -it moe sh -c \"cd whiplashdb && python next_point.py\"'

        x = json.loads(subprocess.check_output(cmd, shell=True))
        C = cost(x)

        print i,x,C

        #append new point to the data and write to file
        data['points'].append([x,C])
        json.dump(data, open('experiment.json','w'))