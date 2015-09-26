#!/bin/bash
# Whiplash container types:
# wdb-rte-container : contains node run-time environment
# wdb-www-container : contains web-interface for queries
# wdb-odb-container : contains mongo database


docker run --name wdb-odb -p 0.0.0.0:27017:27017 -d mongo:latest

docker build -t wdb-www-container -f Dockerfile.www ..
docker run -d -P --name wdb-www --link wdb-odb:mongo -v $PWD/../www:/var/www/html wdb-www-container
alias mongo="docker run -it --link wdb-odb:mongo --rm mongo sh -c 'exec mongo \"\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT\"'"

docker build -t wdb-rte-container -f Dockerfile.rte ..
# TODO:
# needs to contain compiled rte and binaries and then connect to mongo via 
# $MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT 
# commiting new executables here as well
docker run -d -P --name wdb-rte --link wdb-odb:mongo wdb-rte-container

