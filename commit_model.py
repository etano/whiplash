import whiplash,json

# Connect to local Whiplash instance
wdb = whiplash.wdb("localhost","1337","3737f82c02617f63ae1fb2d78c4246538c52500dda238f3a2834585750a3339b")
model = json.load(open('108ising.json'))
models = []
for i in range(100):
    models.append(model)
print wdb.CommitModels(models)
