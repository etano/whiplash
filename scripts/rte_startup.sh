#!/bin/bash

/users/ebrown/src/whiplash/rte/manager.py --cluster --host monchhm24.cscs.ch --port 1337 --num_cpus 20 --log_dir /mnt/lnec/ebrown/logs/rte/ --rte_dir /mnt/lnec/ebrown/rte > /mnt/lnec/ebrown/logs/rte/manager.log 2> /mnt/lnec/ebrown/logs/rte/manager.log < /dev/null &
disown
