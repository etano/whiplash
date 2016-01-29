#!/bin/bash

/users/whiplash/whiplash/scheduler/users.py --cluster --host monchc300.cscs.ch --port 1337 --num_cpus 20 --log_dir /mnt/lnec/whiplash/logs/scheduler/users --scheduler_dir /mnt/lnec/whiplash/rte > /mnt/lnec/whiplash/logs/scheduler/users/log 2> /mnt/lnec/whiplash/logs/scheduler/users/log < /dev/null &
