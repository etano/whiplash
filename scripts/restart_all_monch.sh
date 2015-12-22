#!/bin/bash

killall python3
killall node
killall mongod

bash ~/whiplash/scripts/prepare_rte.sh
bash ~/whiplash/scripts/mongo_startup.sh
bash ~/whiplash/scripts/node_startup.sh
bash ~/whiplash/scripts/scheduler_startup.sh
