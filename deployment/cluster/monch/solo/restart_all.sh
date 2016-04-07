#!/bin/bash

echo 'Killing python'
killall python3
echo 'Killing node'
killall node
echo 'Killing mongo'
killall mongod
echo 'Sleeping 5'
sleep 5

echo 'Setup mongo'
bash ${WHIPLASH_HOME}/deployment/cluster/monch/solo/mongo_setup.sh
echo 'Starting mongo'
bash ${WHIPLASH_HOME}/deployment/cluster/monch/solo/mongo_startup.sh
echo 'Starting node'
bash ${WHIPLASH_HOME}/deployment/cluster/monch/node_startup.sh
echo 'Sleeping 30'
sleep 30
echo 'Initialize user'
bash ${WHIPLASH_HOME}/deployment/cluster/monch/init_users.sh
echo 'Starting RTE'
bash ${WHIPLASH_HOME}/deployment/cluster/monch/rte_startup.sh
