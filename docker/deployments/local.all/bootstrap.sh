#!/bin/bash

# Mongo
docker run --name wdb-odb -p 0.0.0.0:27017:27017 -d mongo:latest
alias mongo="docker run -it --link wdb-odb:mongo --rm mongo sh -c 'exec mongo \"\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT\"'"

# Web-interface
docker run -d -P --name wdb-www --link wdb-odb:mongo whiplash/www:experimental

# Run-time
docker run -d -P --name wdb-rte --link wdb-odb:mongo whiplash/rte-local:deploy sh -c "./drivers/scheduler.driver -dbhost \$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT"
