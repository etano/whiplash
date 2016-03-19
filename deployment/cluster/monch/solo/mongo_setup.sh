#!/bin/bash

mongod --bind_ip=$MONGO_PORT_27017_TCP_ADDR --dbpath /mnt/lnec/$USER/whiplash/data/db --logpath /mnt/lnec/$USER/whiplash/logs/mongo/setup.log --fork
sleep 10
mongo $MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT/wdb odb/startup.js
sleep 10
mongod --shutdown --dbpath /mnt/lnec/$USER/whiplash/data/db
