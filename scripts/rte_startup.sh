#!/bin/bash

# ${1} : address of node

/users/ebrown/src/whiplash/rte/manager.py --cluster --host ${1} --port 1337 --num_cpus 20 --log_dir /mnt/lnec/ebrown/logs/rte/ --rte_dir /mnt/lnec/ebrown/rte > /mnt/lnec/ebrown/logs/rte/manager.log 2> /mnt/lnec/ebrown/logs/rte/manager.log < /dev/null &
disown
