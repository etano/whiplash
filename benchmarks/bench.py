#!/usr/bin/env python3
import sys, os, random
import whiplash
import whipbench as bench

print("Login")
db = whiplash.db(sys.argv[1], int(sys.argv[2]), username=sys.argv[3], password=sys.argv[4])

print("Timer on")
print(db.request("GET", "timer/on", {}))

print("Reset database")
bench.reset_db(db)

print("Benchmarking collections")
sizes = [2]
numbers = [10, 100, 1000]
print("sizes:", sizes)
print("numbers:", numbers)
collections = [
    ['models', []],
    ['executables', ['name', 'description', 'algorithm', 'version', 'build', 'path', 'params']]
]
for collection, required_fields in collections:
    bench.commit(db, collection, sizes, numbers, required_fields=required_fields)
    bench.commit(db, collection, sizes, numbers, required_fields=required_fields)
    bench.count(db, collection, sizes, numbers)
    bench.query_collection(db, collection, sizes, numbers)
    bench.update(db, collection, sizes, numbers)
    bench.stats(db, collection, sizes, numbers)

print("Benchmarking query")
bench.query(db, sizes, numbers)

print("Times")
reports = db.request("GET", "timer", {})['reports']
reports = sorted(reports, key=lambda r: r['total_time'], reverse=True)
for r in reports:
    try:
        print('%s %f %i %f %f'%(r['name'], r['total_time'], r['count'], r['percent_time'], r['average_time']))
    except:
        continue

print("Timer off")
print(db.request("GET", "timer/off", {}))
