#!/bin/bash

echo 'Killing python'
killall python3
echo 'Killing node'
killall node
echo 'Killing mongo'
killall mongod
echo 'Setup mongo'
bash scripts/mongo_setup.sh
echo 'Starting mongo'
bash scripts/mongo_startup.sh
echo 'Preparing RTE'
bash ~/whiplash/scripts/prepare_rte.sh
echo 'Starting node'
bash ~/whiplash/scripts/node_startup.sh
echo 'Sleeping 20'
sleep 20
echo 'Starting python'
bash ~/whiplash/scripts/scheduler_startup.sh
