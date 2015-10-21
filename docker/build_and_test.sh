#!/bin/bash

# build wdb-odb
docker build -t whiplash/odb -f Dockerfile.odb .

# start wdb-odb-test
docker run --name wdb-odb-test -d -p 27018:27017 whiplash/odb --auth

# build wdb-api
docker build -t whiplash/api -f Dockerfile.api ..

# start wdb-api-test
docker run --link wdb-odb-test:mongo --name wdb-api-test -p 1338:1337 -d -P -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/www"

# create user
docker run -it --link wdb-odb-test:mongo -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node createUser.js www 7cJgeAkHdw{oktPNYdgYE3nJ"

# create client
docker run -it --link wdb-odb-test:mongo -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node createClient.js browser 32489 ha87hjlAWidwrxv435est"

# create token
http POST http://192.168.99.100:1337/api/users/token grant_type=password client_id=www-browser client_secret=fd5834157ee2388e65ec195cd74b670570a9f4cea490444ff5c70bb4fd8243ba username=www password=7cJgeAkHdw{oktPNYdgYE3nJ
