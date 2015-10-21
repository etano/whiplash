#!/bin/bash

# stop current containers
docker stop wdb-api; docker rm wdb-api;
docker stop wdb-odb; docker rm wdb-odb;

#run containers
docker run --name wdb-odb -v /data/db:/data/db -p 27017:27017 -d whiplash/odb --auth
docker run --name wdb-api --link wdb-odb:mongo -p 80:1337 -d -P -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/www"

exit 0;
