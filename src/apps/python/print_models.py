import pymongo,pprint

models = pymongo.MongoClient("whiplash.ethz.ch:27017")['wdb']['models']
for model in models.find():
    pprint.pprint(model)
