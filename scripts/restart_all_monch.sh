#!/bin/bash

killall python3
killall node
killall mongod

bash scripts/prepare_rte.sh
bash scripts/mongo_startup.sh
bash scripts/node_startup.sh
bash scripts/scheduler_startup.sh
