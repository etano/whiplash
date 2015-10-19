import whiplash,json

# Connect to local Whiplash instance
wdb = whiplash.wdb("whiplash.ethz.ch","1337","e0affd5b02be43f644ceea8ad8f7f8e2fa48afa9dfab06fc3f57190740c16ee9")
model = json.load(open('108ising.json'))
models = []
for i in range(1):
    models.append(model)
print wdb.models.commit(models)
