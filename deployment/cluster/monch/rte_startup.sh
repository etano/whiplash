#!/bin/bash

cp $WHIPLASH_HOME/rte/*.py /mnt/lnec/$USER/rte/
/mnt/lnec/$USER/whiplash/manager.py --cluster --host ${HOSTNAME}.cscs.ch --port $NODE_PORT --num_cpus 20 --log_dir /mnt/lnec/$USER/whiplash/logs/rte/ --rte_dir /mnt/lnec/$USER/whiplash/rte > /mnt/lnec/$USER/whiplash/logs/rte/manager.log 2> /mnt/lnec/$USER/whiplash/logs/rte/manager.log < /dev/null &
disown
