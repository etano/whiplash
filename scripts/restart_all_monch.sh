#!/bin/bash

echo 'Killing python'
killall python3
echo 'Killing node'
killall node

echo 'Preparing RTE'
bash ~/whiplash/scripts/prepare_rte.sh
echo 'Starting node'
bash ~/whiplash/scripts/node_startup.sh
echo 'Starting python'
bash ~/whiplash/scripts/scheduler_startup.sh
