import subprocess,json,whiplashdb
import math

wdb = whiplashdb.wdb("localhost:27017")

model_id = wdb.CommitModel('src/tests/108ising.json')
executable_id = wdb.CommitExecutable({'class':'ising','description':'foo','algorithm':'SA','version':'bar','build':'O3','schedule':'linear','path':'./apps/spin_glass_solver/bin/main','name':'test'})

n_reps = 1000 #number of repetitions
p_chance = 0.99 #chance of finding optimal config

def func(x):

    params = {'n_sweeps':x[0],'b0':x[1],'b1':x[2]}
    status = 0
    properties = [wdb.FormProperty('ising',model_id,executable_id,status,params) for i in range(n_reps)]
    wdb.CommitProperties(properties)

    property_filter = {'class':'ising','status':3}
    
    property_ids = []
    while len(property_ids) < 0.99*n_reps:
        property_ids = wdb.QueryProperties(property_filter)

    num_success = 0
    for id in property_ids:
        property = wdb.FetchProperty(id)
        if property['cfg']['costs'] == cost_opt:
            num_success += 1

    p_success = float(num_success) / len(property_ids)

    complexity = x[0]*math.log(1.0-p_chance)/math.log(1.0-p_success) #n_sweeps * expected number of repetitions

    return complexity

data = {}

data['limits'] = []
data['limits'].append([0.0,10.0]) #beta0
data['limits'].append([0.0,10.0]) #beta1
data['limits'].append([0,10000]) #sweeps

data['var'] = 0.01 #noise

data['points'] = []

x0 = [5.0,0.1,1000]

data['points'].append([x0,func(x0)])

json.dump(data, open('experiment.json','w'))

for i in range(10):

    cmd = 'docker exec -it moe sh -c \"cd whiplashdb && python test.py\"'
    x = json.loads(subprocess.check_output(cmd, shell=True))

    C = func(x)

    print i,x,C

    data['points'].append([x,C])
    json.dump(data, open('experiment.json','w'))
