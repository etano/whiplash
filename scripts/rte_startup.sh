#!/bin/bash

/users/whiplash/whiplash/rte/manager.py --cluster --host monchc300.cscs.ch --port 1337 --num_cpus 20 --log_dir /mnt/lnec/whiplash/logs/rte/ --rte_dir /mnt/lnec/whiplash/rte > /mnt/lnec/whiplash/logs/rte/manager.log 2> /mnt/lnec/whiplash/logs/rte/manager.log < /dev/null &
disown
