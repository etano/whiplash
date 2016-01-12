#!/usr/bin/env python3

import sys,os,whiplash,json,random,copy

print("Login")
host = sys.argv[1]
port = int(sys.argv[2])

###

wdb = whiplash.wdb(host,port,username="test",password="test")

#print("Create scheduler token")
#wdb.create_token(username="test",password="test",client_id='test-scheduler',client_secret='test',save_token=False)

#wdb = whiplash.wdb(host,port)

sys.exit(0)

###

print("Reset database")
wdb.collaborations.delete({})
assert wdb.collaborations.count({}) == 0
wdb.jobs.delete({})
assert wdb.jobs.count({}) == 0
wdb.models.delete({})
assert wdb.models.count({}) == 0
wdb.executables.delete({})
assert wdb.executables.count({}) == 0
wdb.properties.delete({})
assert wdb.properties.count({}) == 0
wdb.work_batches.delete({})
assert wdb.work_batches.count({}) == 0

print("Commit model")
N = 4
hamiltonian = []
for i in range(N):
    for j in range(i+1,N):
        value = 2.0*random.random()-1.0
        hamiltonian.append([[i,j],value])
tags = {"n_spins":N, "name":"test"}
model = {"content":{"edges": hamiltonian}}
model.update(tags)
model_id = wdb.models.commit(model)[0]

print("Query model")
assert model_id == wdb.models.query_fields_only(tags,'_id')['_id'][0]

print("Commit executable")
executable = {"name":"test", "algorithm":"test", "version":"test", "build":"test", "path":os.getcwd()+"/tests/sleeper.py", "description":"test", "params":{"required":["sleep_time"],"optional":[]}}
executable_id = wdb.executables.commit(executable)[0]

print("Query executable")
assert executable_id == wdb.executables.query_fields_only(executable,'_id')['_id'][0]

print("Query for some results")
print(wdb.query({"name":"test"}, {"name":"test"}, {"sleep_time":1.0}, 10))

sys.exit(0)

print("Submit properties")
N0 = 1000; t0 = 1.2
N1 = 3; t1 = 2.0; w1 = 1.0

props = []
for i in range(N0): props.append({"params":{"sleep_time":1.0,"seed":i}, "input_model_id":model_id, "executable_id":executable_id,"timeout":t0})
for k in range(N0,N0+N1):

    hamiltonian = []
    for i in range(N):
        for j in range(i+1,N):
            value = 2.0*random.random()-1.0
            hamiltonian.append([[i,j],value])
    tags = {"n_spins":N, "name":"test"+str(k)}
    model = {"content":{"edges": hamiltonian}}
    model.update(tags)
    model_id = wdb.models.commit(model)[0]

    props.append({"params":{"sleep_time":1.0, "seed":k}, "input_model_id":model_id, "output_model_id":model_id, "executable_id":executable_id, "timeout":t1, "status":"resolved", "walltime":w1, "log":"some kind of output"})
wdb.properties.commit(props)

print("Check property stats")
assert wdb.properties.get_unresolved_time() == N0*t0
assert wdb.properties.get_resolved_time() == N1*w1

stats = wdb.properties.stats("timeout",{"status":"unresolved"})
assert stats['mean'] == t0
assert stats['variance'] == 0.0
assert stats['stddev'] == 0.0
assert stats['count'] == N0

print("Check jobs stats")
job_stats = wdb.jobs.stats('','')
assert job_stats['count'] == 1
assert job_stats['stats'][0]['togo'] == N0
assert job_stats['stats'][0]['done'] == N1

print("Querying results")

prop_ids = wdb.properties.query_fields_only({"status":"resolved","params.sleep_time":1.0},'_id')['_id']

assert len(prop_ids) == N1

print("Try to commit again")
models = []
for ID in prop_ids:
    model1 = copy.deepcopy(model)
    model1['property_id'] = ID
    models.append(model1)
model_ids = wdb.models.commit(models)
assert len(model_ids) == N1
assert len(wdb.models.query({'property_id': {'$in': prop_ids}})) == N1
