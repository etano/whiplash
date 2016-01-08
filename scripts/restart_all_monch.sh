#!/bin/bash

echo 'Killing python'
killall python3
echo 'Killing node'
killall node
echo 'Killing mongo'
killall mongod

HOME="/users/whiplash/whiplash"

echo 'Setup mongo'
bash ${HOME}/scripts/mongo_setup.sh
echo 'Starting mongo'
bash ${HOME}/scripts/mongo_startup.sh
echo 'Preparing RTE'
bash ${HOME}/scripts/prepare_rte.sh
echo 'Starting node'
bash ${HOME}/scripts/node_startup.sh
echo 'Sleeping 30'
sleep 30
echo 'Starting python'
bash ${HOME}/scripts/scheduler_startup.sh
