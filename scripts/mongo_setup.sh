#!/bin/bash

mongod --bind_ip=127.0.0.1 --dbpath /mnt/lnec/whiplash/data/db --logpath /users/whiplash/logs/mongod.log --fork
sleep 5
mongo 127.0.0.1:27017/wdb odb/docker-startup.js
sleep 5
mongod --shutdown --dbpath /mnt/lnec/whiplash/data/db
