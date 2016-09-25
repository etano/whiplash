import random, time, logging
from string import ascii_uppercase
random.seed(0)

logging.basicConfig(filename='./stats.log', level=logging.INFO)

def reset_db(db):
    db.collection("work_batches").delete({})
    db.queries.delete({})
    db.models.delete({})
    db.executables.delete({})
    db.properties.delete({})

def timer(*args):
    db = args[0]
    function = args[1]
    args = args[2:]
    db.request("GET", "timer/on", {})
    t0 = time.time()
    res = function(*args)
    t1 = time.time()
    reports = db.request("GET", "timer", {})['reports']
    pretty_print(reports)
    db.request("GET", "timer/off", {})
    return t1 - t0, res

def pretty_print(reports):
    for k,v in sorted(reports.items(), key=lambda r: r[1]['total_time'], reverse=True):
        try:
            if (v['total_time'] > 0):
                print('%s %f %i %f %f'%(k, v['total_time'], v['count'], v['percent_time'], v['average_time']))
        except:
            continue

def commit(db, collection, sizes, numbers, obj={}, required_fields=[]):
    for size in sizes:
        for number in numbers:
            print('Committing %i %s with size %i\n'%(number, collection, size))
            objs = []
            for i in range(number):
                new_obj = obj.copy()
                new_obj["size"] = size
                new_obj["number"] = number
                new_obj["index"] = i
                new_obj["data"] = ''.join('a' for i in range(size))
                for field in required_fields:
                    new_obj[field] = str(size)+"_"+str(number)+"_"+str(i)
                objs.append(new_obj)
            t, res = timer(db, db.collection(collection).commit, objs)
            logging.info('%s commit %i %i %f', collection, number, size, t)
            assert len(res['ids']) == number
            print('Finished in %f seconds\n'%(t))

def count(db, collection, sizes, numbers, filter={}):
    for size in sizes:
        for number in numbers:
            print('Counting %i %s with size %i\n'%(number, collection, size))
            if collection == 'properties':
                new_filter = {
                    "params.size": size,
                    "params.number": number
                }
            else:
                new_filter = {
                    "size": size,
                    "number": number
                }
            t, res = timer(db, db.collection(collection).count, new_filter)
            logging.info('%s count %i %i %f', collection, number, size, t)
            assert res == number
            print('Finished in %f seconds\n'%(t))

def query_collection(db, collection, sizes, numbers, filter={}):
    for size in sizes:
        for number in numbers:
            print('Querying %i %s with size %i\n'%(number, collection, size))
            if collection == 'properties':
                new_filter = {
                    "params.size": size,
                    "params.number": number
                }
            else:
                new_filter = {
                    "size": size,
                    "number": number
                }
            t, res = timer(db, db.collection(collection).query, new_filter)
            logging.info('%s query %i %i %f', collection, number, size, t)
            if collection == 'properties':
                assert len(res) == number*number
            else:
                assert len(res) == number
            print('Finished in %f seconds\n'%(t))

def update(db, collection, sizes, numbers, filter={}, update={}):
    for size in sizes:
        for number in numbers:
            print('Updating %i %s with size %i\n'%(number, collection, size))
            new_filter = filter.copy()
            new_filter = {
                "size": size,
                "number": number
            }
            new_update = update.copy()
            new_update = {
                "new_field": str(size)+"_"+str(number)
            }
            t, res = timer(db, db.collection(collection).update, new_filter, new_update)
            logging.info('%s update %i %i %f', collection, number, size, t)
            assert res == number
            print('Finished in %f seconds\n'%(t))

def stats(db, collection, sizes, numbers, filter={}):
    for size in sizes:
        for number in numbers:
            print('Computing stats %i %s with size %i\n'%(number, collection, size))
            new_filter = filter.copy()
            new_filter["size"] = size
            new_filter["number"] = number
            field = "size"
            t, res = timer(db, db.collection(collection).stats, field, new_filter)
            logging.info('%s stats %i %i %f', collection, number, size, t)
            assert res["count"] == number
            print('Finished in %f seconds\n'%(t))

def mapreduce(db, collection, sizes, numbers, filter, mapper, reducer, finalizer):
    print("NOT YET IMPLEMENTED")

def submit(db, sizes, numbers, filters={}):
    for size in sizes:
        for number in numbers:
            print('Submitting %i queries with size %i\n'%(number*number, size))
            new_filters = filters.copy()
            if not 'input_model' in new_filters:
                new_filters['input_model'] = {}
            new_filters['input_model']['size'] = size
            new_filters['input_model']['number'] = number
            if not 'executable' in new_filters:
                new_filters['executable'] = {}
            new_filters['executable']['size'] = size
            new_filters['executable']['number'] = number
            if not 'params' in new_filters:
                new_filters['params'] = {}
            new_filters['params']['size'] = size
            new_filters['params']['number'] = number
            new_filters['params']['run_time'] = 1.0
            t, res = timer(db, db.submit, new_filters)
            logging.info('root submit %i %i %f', number, size, t)
            assert res['total'] == number*number
            print('Finished in %f seconds\n'%(t))

def query(db, sizes, numbers, filters={}):
    for size in sizes:
        for number in numbers:
            print('Querying %i items with size %i\n'%(number*number, size))
            new_filters = filters.copy()
            if not 'input_model' in new_filters:
                new_filters['input_model'] = {}
            new_filters['input_model']['size'] = size
            new_filters['input_model']['number'] = number
            if not 'executable' in new_filters:
                new_filters['executable'] = {}
            new_filters['executable']['size'] = size
            new_filters['executable']['number'] = number
            if not 'params' in new_filters:
                new_filters['params'] = {}
            new_filters['params']['size'] = size
            new_filters['params']['number'] = number
            new_filters['params']['run_time'] = 1.0
            t, res = timer(db, db.query, new_filters)
            logging.info('root query %i %i %f', number, size, t)
            assert len(res) == number*number
            print('Finished in %f seconds\n'%(t))
