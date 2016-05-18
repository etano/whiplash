#!/bin/bash

echo "Starting whiplash on ${HOSTNAME}..."
cd $HOME/src/whiplash
source deployment/cluster/monch/init_monch.sh
sh deployment/cluster/monch/restart_all.sh

echo "Going to sleep now..."
for (( ; ; ))
do
   sleep 100
done
