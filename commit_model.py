import whiplash,json

# Connect to local Whiplash instance
wdb = whiplash.wdb("whiplash.ethz.ch","1337","93690945c6e6ad77ab47b15f77c4831942bc5ab24ea2662754d02967d2a23f29")
model = json.load(open('108ising.json'))
models = []
for i in range(100):
    models.append(model)
print wdb.CommitModels(models)
