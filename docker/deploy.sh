#!/bin/bash

# restart odb
docker stop wdb-odb; docker rm wdb-odb;
docker run --name wdb-odb -v /data/db:/data/db -p 27017:27017 -d whiplash/odb --auth

# restart apis
n=${1:-1} # number of NodeJS instances
for (( i=0; i<$n; i++ ))
do
    p=$((1337+$i))
    docker stop wdb-api-$p; docker rm wdb-api-$p;
    docker run --name wdb-api-$p --link wdb-odb:mongo -p $p:1337 -d -P -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/www"
done
