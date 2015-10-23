#!/bin/bash

# remove whiplash-python
rm -rf whiplash-python

# kill and remove test containers
docker stop wdb-api-test; docker rm wdb-api-test;
docker stop wdb-odb-test; docker rm wdb-odb-test;
