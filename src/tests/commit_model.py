import whiplashdb
wdb = whiplashdb.wdb("192.168.99.100:27017")
for i in range(100):
    print i
    model_id = wdb.CommitModel('108ising.json')
