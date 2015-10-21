#!/bin/bash

# testing flags
set -e
trap 'previous_command=$this_command; this_command=$BASH_COMMAND' DEBUG
trap 'echo "exit $? : $previous_command"' EXIT

# build wdb-odb
docker build -t whiplash/odb -f Dockerfile.odb .

# start wdb-odb-test
docker run --name wdb-odb-test -d whiplash/odb --auth

# build wdb-api
docker build -t whiplash/api -f Dockerfile.api ..

# start wdb-api-test
docker run --link wdb-odb-test:mongo --name wdb-api-test -p 1338:1337 -d -P -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/www"

# create user
docker run -it --link wdb-odb-test:mongo -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/createUser.js www 7cJgeAkHdw{oktPNYdgYE3nJ"

# create client
docker run -it --link wdb-odb-test:mongo -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/createClient.js browser 32489 ha87hjlAWidwrxv435est"

# push containers
docker push whiplash/odb
docker push whiplash/api

# kill and remove containers
docker stop wdb-api-test; docker rm wdb-api-test;
docker stop wdb-odb-test; docker rm wdb-odb-test;
