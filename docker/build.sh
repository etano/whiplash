#!/bin/bash

docker run -it -P --name wdb-build145 --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src; WDB_HOME=/usr/src/wdb/mount make -j4"
docker run -it -P --name wdb-build145 --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src/apps/; WDB_HOME=/usr/src/wdb/mount ./build_apps.sh"
docker build -t whiplash/rte-local:deploy -f Dockerfile.deploy ..

# Test of the local deployment:
#
# docker run --name wdb-odb145 -p 0.0.0.0:27017:27017 -d mongo:latest
# docker run -d -P --name wdb-rte145 --link wdb-odb145:mongo -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src/ && ./apps/drivers/scheduler.driver -dbhost \$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT"
# docker run -it -P --name wdb-build145 --link wdb-odb145:mongo --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src/tests; WDB_HOME=/usr/src/wdb/mount ./demo0.sh"

