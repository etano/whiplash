#!/bin/bash
# Workflow: start mongo, start scheduler, run demo

docker run --name odb -p 0.0.0.0:27017:27017 -d mongo:latest
docker run -d -P --name rte --link odb:mongo -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src/ && ./apps/drivers/scheduler.driver -dbhost \$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT"
docker run -it -P --link odb:mongo --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src/tests; WDB_HOME=/usr/src/wdb/mount ./demo.docker.sh"

