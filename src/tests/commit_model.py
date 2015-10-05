import whiplashdb
wdb = whiplashdb.wdb("localhost:27017")
for i in range(100):
    print i
    model_id = wdb.CommitModel('108ising.json')
