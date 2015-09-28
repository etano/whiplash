import sys,pymongo

which = {}
for i in range(1,len(sys.argv)):
    arg = sys.argv[i]
    if '--' in arg:
        which[arg.lstrip('-')] = sys.argv[i+1]
        i += 1

client = pymongo.MongoClient("whiplash.ethz.ch:27017")
db = client['wdb']
models = db['models']

for model in models.find(which):
    print model
