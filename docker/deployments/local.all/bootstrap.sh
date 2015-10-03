#!/bin/bash

# Mongo
docker run --name wdb-odb -v /data/db:/data/db -p 27017:27017 -d mongo:latest
alias mongo="docker run -it --link wdb-odb:mongo --rm mongo sh -c 'exec mongo \"\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT\"'"

# Web-interface
mkdir /var/www/storage
chmod 777 /var/wwww/storage
docker run --link wdb-odb:mongo --name wdb-www -p 80:80 -v /var/www/storage:/var/www/html/uploads -d -P -t whiplash/www:experimental

# Run-time
docker run --name wdb-rte --link wdb-odb:mongo whiplash/rte-local:deploy -d -P sh -c "./drivers/scheduler.driver -dbhost \$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT"
