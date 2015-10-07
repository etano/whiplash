#!/bin/bash

# Mongo
docker run --name wdb-odb -p 27017:27017 -d mongo:latest
alias mongo="docker run -it --link wdb-odb:mongo --rm mongo sh -c 'exec mongo \"\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT\"'"

# Format database
docker run -d -P --name wdb-rte-format --link wdb-odb:mongo whiplash/rte-local:deploy sh -c "./bin/format_db.driver -dbhost \$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT"

# Start scheduler
docker run -d -P --name wdb-rte-scheduler --link wdb-odb:mongo whiplash/rte-local:deploy sh -c "./bin/scheduler.driver -dbhost \$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT"

# Demo
cd ../src/tests
./demo.py 192.168.99.100:27017
cd ../../docker
