import whiplash,json

# Connect to local Whiplash instance
wdb = whiplash.wdb("whiplash.ethz.ch","1337","1534d75d461100ab696aaac2e800d2ec7c88172d6394b89bfc6566611d1ef99f")
model = json.load(open('108ising.json'))
models = []
for i in range(10):
    models.append(model)
print wdb.models.commit(models)
