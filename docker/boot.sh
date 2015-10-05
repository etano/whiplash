#!/bin/bash

# Mongo
docker run --name wdb-odb -v /data/db:/data/db -p 27017:27017 -d mongo:latest
alias mongo="docker run -it --link wdb-odb:mongo --rm mongo sh -c 'exec mongo \"\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT\"'"

# Run-time
docker run -d -P --name wdb-rte --link wdb-odb:mongo whiplash/rte-local:deploy sh -c "./bin/scheduler.driver -dbhost \$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT"

# Web-interface
mkdir -p /var/www/storage
chmod -R 777 /var/wwww/storage
docker run --link wdb-odb --name wdb-www -p 80:80 -v /var/www/storage:/var/www/html/uploads -d -P -t whiplash/www:experimental
