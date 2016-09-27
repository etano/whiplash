#!/usr/bin/env python3
import whiplash

print("Login as admin")
db = whiplash.db("localhost", 1337, username="admin", password="password")

print("Reset database")
db.collection("work_batches").delete({})
db.queries.delete({})
assert db.queries.count({}) == 0
db.models.delete({})
assert db.models.count({}) == 0
db.executables.delete({})
assert db.executables.count({}) == 0
db.properties.delete({})
assert db.properties.count({}) == 0
db.sets.delete({})
assert db.sets.count({}) == 0
