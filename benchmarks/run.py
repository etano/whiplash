import benchmark,sys

def perform_benchmark(bm,N):
    model_id = bm.commit("models","model.json",N)[0]
    executable_id = bm.commit("executables","executable.json",N)[0]
    params = {'n_sweeps':'10','T_0':'10.0','T_1':'1.e-8','seed':'0'}
    property = {'executable_id':executable_id,'model_id':model_id,'params':params}
    bm.commit("properties",property,N)

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
bm_pymongo.clean()
perform_benchmark(bm_pymongo,N)

print('Using API')
bm_pymongo.clean()
perform_benchmark(bm_api,N)
