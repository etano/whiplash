#!/bin/bash

# database self-contained
docker stop wdb-odb; docker rm wdb-odb; docker pull whiplash/odb;
docker run --name wdb-odb -v /data/db:/data/db -d -p 27017:27017 whiplash/odb --auth
alias mongo="docker run -it --link wdb-odb:mongo --rm whiplash/odb sh -c 'mongo $MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT/wdb'"

# API
docker stop wdb-api; docker rm wdb-api; docker pull whiplash/api;
docker run --link wdb-odb:mongo --name wdb-api -p 80:1337 -d -P -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/www"
