import sys,pymongo,json

which = {}
for i in range(1,len(sys.argv)):
    arg = sys.argv[i]
    if '--' in arg:
        which[arg.lstrip('-')] = sys.argv[i+1]
        i += 1

models = pymongo.MongoClient("whiplash.ethz.ch:27017")['wdb']['models']
for model in models.find(which):
    print json.dumps(model)
