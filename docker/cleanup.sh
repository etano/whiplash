#!/bin/bash

# kill and remove containers
docker stop wdb-api-test; docker rm wdb-api-test;
docker stop wdb-odb-test; docker rm wdb-odb-test;