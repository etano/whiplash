import sys,pymongo,json,time

data = {}
for i in range(1,len(sys.argv)):
    arg = sys.argv[i]
    if '--' in arg:
        data[arg.lstrip('-')] = sys.argv[i+1]
        i += 1

required_fields = ['class','owner','path','description','algorithm','version','build']
for field in required_fields:
    if field not in data:
        print 'Please add property:',field
        sys.exit(0)

executables = pymongo.MongoClient("whiplash.ethz.ch:27017")['wdb']['executables']

_id = executables.find().count()

data['_id'] = _id
data['timestamp'] = time.time()

executables.insert_one(data)

print _id
