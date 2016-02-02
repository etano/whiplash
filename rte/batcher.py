#!/usr/bin/env python3

import sys, logging, argparse, time, json
import whiplash

def make_batches(db,time_window):
    logging.info('querying properties')
    properties = db.properties.query({"status":"unresolved","timeout":{"$lt":time_window}},['_id','timeout','input_model_id','executable_id','owner'])

    logging.info('building batches')
    batches = []
    times_left = []
    ids_in_batches = []
    for i in range(len(properties)):
        if len(batches)==1000: # TODO set limit on server
            break
        found = False
        for j in range(len(batches)):
            if properties[i]['timeout'] < times_left[j]:
                times_left[j] -= properties[i]['timeout']
                batches[j]['property_ids'].append(properties[i]['_id'])
                batches[j]['model_ids'].append(properties[i]['input_model_id'])
                batches[j]['executable_ids'].append(properties[i]['executable_id'])
                batches[j]['total_time'] += properties[i]['timeout']
                found = True
                ids_in_batches.append(properties[i]['_id'])
                break
        if not found:
            batches.append({
                'property_ids': [properties[i]['_id']],
                'model_ids': [properties[i]['input_model_id']],
                'executable_ids': [properties[i]['executable_id']],
                'total_time': properties[i]['timeout']
            })
            times_left.append(time_window - properties[i]['timeout'])
            ids_in_batches.append(properties[i]['_id'])

    for batch in batches:
        batch['model_ids'] = list(set(batch['model_ids']))
        batch['executable_ids'] = list(set(batch['executable_ids']))

    if len(batches) > 0:
        logging.info('committing batches')
        db.properties.update({'_id': {'$in': ids_in_batches}},{'status':"pulled"})
        db.collection('work_batches').commit(batches)
        logging.info('done')
    else:
        logging.info('no suitable work')

def get_times(args,db):
    logging.info('getting times')
    th = int(11.8*3600)
    timeouts = db.properties.stats("timeout",{"status":{"$in":["unresolved"]}})
    logging.info(json.dumps(timeouts))
    if timeouts['count'] == 0 or timeouts['min'] > th:
        return 0
    else:
        th_min = 60
        time_window = min(th,max(1.2*timeouts['max'],th_min))
        return time_window

def scheduler(args):
    db = whiplash.db(args.host,args.port,token=args.token)
    logging.info('%s batcher scheduler connected to db', args.user)

    while True:
        time_window = get_times(args,db)
        if time_window > 0:
            make_batches(db,time_window)
        time.sleep(1)
        if args.test:
            break

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('--host',dest='host',required=True,type=str)
    parser.add_argument('--port',dest='port',required=True,type=int)
    parser.add_argument('--token',dest='token',required=True,type=str)
    parser.add_argument('--user',dest='user',required=True,type=str)
    parser.add_argument('--test',dest='test',required=False,default=False,action='store_true')
    parser.add_argument('--log_dir',dest='log_dir',required=False,type=str,default='.')
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_dir+'/'+args.user+'_batch_'+str(int(time.time()))+'.log', level=logging.INFO, format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
    scheduler(args)
