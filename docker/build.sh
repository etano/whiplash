#!/bin/bash

docker run -it -P --name wdb-build2 --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src; WDB_HOME=/usr/src/wdb/mount make -j4"
docker run -it -P --name wdb-build2 --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src/apps; WDB_HOME=/usr/src/wdb/mount ./build_apps.sh"
docker build -t whiplash/rte-local:deploy -f Dockerfile.deploy ..

# TEST:
# docker run --name wdb-odb -p 0.0.0.0:27017:27017 -d mongo:latest
# docker run -d -P --name wdb-rte --link wdb-odb:mongo whiplash/rte-local:deploy sh -c "./drivers/scheduler.driver"
