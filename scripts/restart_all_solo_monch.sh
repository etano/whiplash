#!/bin/bash

# ${1} : node

echo 'Killing python'
killall python3
echo 'Killing node'
killall node
echo 'Killing mongo'
killall mongod
echo 'Sleeping 5'
sleep 5

WHIPLASH_HOME="/users/ebrown/src/whiplash"

echo 'Setup mongo'
bash ${WHIPLASH_HOME}/scripts/mongo_setup.sh
echo 'Starting mongo'
bash ${WHIPLASH_HOME}/scripts/mongo_startup.sh
echo 'Preparing RTE'
bash ${WHIPLASH_HOME}/scripts/prepare_rte.sh
echo 'Starting node'
bash ${WHIPLASH_HOME}/scripts/node_startup.sh
echo 'Sleeping 30'
sleep 30
echo 'Starting RTE'
bash ${WHIPLASH_HOME}/scripts/rte_startup.sh ${1}.cscs.ch
