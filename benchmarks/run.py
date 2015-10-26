import benchmark,sys,json

def perform_benchmark(bm,N):
    bm.clean()

    model = json.load(open("model.json"))
    executable = json.load(open("executable.json"))
    models,executables = [],[]
    for i in range(N):
        model['class'] = i
        models.append(model.copy())
        executable['version'] = i
        executables.append(executable.copy())
    model_ids = bm.commit("models",models)
    executable_ids = bm.commit("executables",executables)

    properties = []
    for model_id in model_ids:
        properties.append({'executable_id':executable_ids[0],'model_id':model_id,'params':{'n':0}})
    property_ids = bm.commit("properties",properties)

    bm.query("properties",{"status":0})
    bm.query("models",{"class":"ising"})
    bm.query("executables",{"class":"ising"})

    # bm.resolve("scheduler")
    # bm.resolve("native")
    # bm.resolve("script")

server = "192.168.99.100"
port = "1337"
N = 10000

# Instatiate benchmark objects
bm_pymongo = benchmark.benchmark(server,port,True)
bm_api = benchmark.benchmark(server,port,False)

print('Using PyMongo')
perform_benchmark(bm_pymongo,N)

print('Using API')
perform_benchmark(bm_api,N)
