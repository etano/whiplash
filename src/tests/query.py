from pymongo import MongoClient

client = MongoClient()
properties = client['wdb']['properties']

filter = {"status":3}
target = {"cfg.costs":1,"_id":0}

print [x['cfg']['costs'][0] for x in properties.find(filter,target)]
