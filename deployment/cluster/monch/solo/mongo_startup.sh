#!/bin/bash

numactl --interleave=all mongod --logpath /mnt/lnec/$USER/whiplash/logs/mongo/mongod.log --dbpath /mnt/lnec/$USER/whiplash/data/db --journal --fork --auth --bind_ip $MONGO_PORT_27017_TCP_ADDR --port $MONGO_PORT_27017_TCP_PORT
