#!/bin/bash

mongod --bind_ip=127.0.0.1 --dbpath /mnt/lnec/whiplash/data_test/db --logpath tmp.log --fork
sleep 10
mongo 127.0.0.1:27017/wdb odb/startup.js
sleep 10
mongod --shutdown --dbpath /mnt/lnec/whiplash/data_test/db
rm tmp.log
