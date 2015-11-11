#!/bin/bash

mongod --bind_ip=127.0.0.1 --dbpath /mnt/lnec/whiplash/data/db
sleep 5
mongo 127.0.0.1:27017/wdb odb/docker-startup.sh
sleep 5
mongod --shutdown
