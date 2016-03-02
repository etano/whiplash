#!/bin/bash

echo "Starting whiplash on ${HOSTNAME}..."
cd $HOME/src/whiplash
source scripts/init_monch.sh
sh scripts/restart_all_solo_monch.sh ${HOSTNAME}

echo "Going to sleep now..."
for (( ; ; ))
do
   sleep 100
done
