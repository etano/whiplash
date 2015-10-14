#!/bin/bash

docker run --name wdb-api -p 1337:1337 -e "MONGO_URI=mongodb://ds053190.mongolab.com:53190/wdb" -e "MONGO_READWRITEUSER_USERNAME=readWriteUser" -e "MONGO_READWRITEUSER_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -d -t whiplash/api sh -c "cd src; node bin/www"
