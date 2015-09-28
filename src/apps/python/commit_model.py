import sys,json,pymongo,time

if len(sys.argv) == 1:
    print 'Please enter model file'
    sys.exit(0)

data = json.load(open(sys.argv[1]))

required_fields = ['class','owner']
for field in required_fields:
    if field not in data:
        print 'Please add property:',field
        sys.exit(0)

client = pymongo.MongoClient("whiplash.ethz.ch:27017")
db = client['wdb']
models = db['models']

_id = models.find().count()

data['_id'] = _id
data['timestamp'] = time.time()

models.insert_one(data)

print _id
