import benchmark,sys

server = "whiplash.ethz.ch"
port = "1337"
token = "1534d75d461100ab696aaac2e800d2ec7c88172d6394b89bfc6566611d1ef99f"

with benchmark.benchmark(server,port,token) as bm:

    bm.commit("properties","property2.json",10)
    bm.commit("models","model.json",10)
    bm.commit("executables","executable.json",10)

    bm.query("properties",{"status":0})
    bm.query("models",{"class":"ising"})
    bm.query("executables",{"name":"an_ms_r1_nf_v0"})

    # bm.resolve("scheduler")
    # bm.resolve("native")
    # bm.resolve("script")

