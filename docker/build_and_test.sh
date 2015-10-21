#!/bin/bash

set -e
trap 'echo "exit $? due to $previous_command"' EXIT

# build wdb-odb
docker build -t whiplash/odb -f Dockerfile.odb .

# start wdb-odb-test
docker run --name wdb-odb-test -d whiplash/odb --auth
echo $?

cat asdfasdfasdf

# build wdb-api
docker build -t whiplash/api -f Dockerfile.api ..
echo $?

# start wdb-api-test
docker run --link wdb-odb-test:mongo --name wdb-api-test -p 1338:1337 -d -P -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/www"
echo $?

# create user
docker run -it --link wdb-odb-test:mongo -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/createUser.js www 7cJgeAkHdw{oktPNYdgYE3nJ"
echo $?

# create client
docker run -it --link wdb-odb-test:mongo -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/createClient.js browser 32489 ha87hjlAWidwrxv435est"
echo $?

# create token
http POST http://192.168.99.100:1337/api/users/token grant_type=password client_id=www-browser client_secret=fd5834157ee2388e65ec195cd74b670570a9f4cea490444ff5c70bb4fd8243ba username=www password=7cJgeAkHdw{oktPNYdgYE3nJ
echo $?

# kill and remove containers
docker stop wdb-api-test; docker rm wdb-api-test;
docker stop wdb-odb-test; docker rm wdb-odb-test;
