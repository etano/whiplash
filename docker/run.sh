#!/bin/bash

docker run --name wdb-api -p 1337:1337 -e "MONGO_URI=mongodb://whiplash.ethz.ch:27017/wdb" -e "MONGO_API_USERNAME=readWriteUser" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -d -t whiplash/api sh -c "cd src; node bin/www"
