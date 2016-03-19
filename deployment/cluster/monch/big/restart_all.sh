#!/bin/bash

echo 'Killing python'
killall python3
echo 'Killing node'
killall node
echo 'Killing mongo'
killall mongod
killall mongos
echo 'Sleeping 5'
sleep 5

WHPILASH_HOME="/users/whiplash/whiplash"

echo 'Starting mongo'
bash ${WHPILASH_HOME}/deployment/cluster/monch/big/deploy.sh
echo 'Starting node'
bash ${WHPILASH_HOME}/deployment/cluster/monch/node_startup.sh
echo 'Sleeping 30'
sleep 30
echo 'Starting RTE'
bash ${WHPILASH_HOME}/deployment/cluster/monch/rte_startup.sh
