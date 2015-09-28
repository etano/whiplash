import pymongo,pprint

client = pymongo.MongoClient("whiplash.ethz.ch:27017")
db = client['wdb']
models = db['models']

for model in models.find():
    pprint.pprint(model)
