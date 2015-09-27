#!/bin/bash


# WDB-ODB-CONTAINER : contains mongo database
docker run --name wdb-odb -p 0.0.0.0:27017:27017 -d mongo:latest


# WDB-WWW-CONTAINER : contains web-interface for queries
docker build -t wdb-www-container -f Dockerfile.www ..
docker run -d -P --name wdb-www --link wdb-odb:mongo wdb-www-container
alias mongo="docker run -it --link wdb-odb:mongo --rm mongo sh -c 'exec mongo \"\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT\"'"


# WDB-BUILD-CONTAINER : contains all dependencies compiled
cd ../depends/mongo-c-driver && git submodule update --init && cd ../../docker
docker build -t wdb-build-container -f Dockerfile.build ..

# make drivers
docker run -it -P --name wdb-build --link wdb-odb:mongo --rm -v $PWD/../:/usr/src/wdb/mount wdb-build-container sh -c "cd mount/src; make"
# make apps
docker run -it -P --name wdb-build --link wdb-odb:mongo --rm -v $PWD/../:/usr/src/wdb/mount wdb-build-container sh -c "cd mount/src/apps; ./build_apps.sh"


# WDB-SCHEDULER-CONTAINER : runs scheduler + workers
# ...
