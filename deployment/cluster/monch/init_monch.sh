#!/bin/bash

# Modules
module load python/3.4.1-gcc-4.8.1

# Whiplash
export WHIPLASH_HOME="/users/$USER/src/whiplash"

# Get passwords
source $WHIPLASH_HOME/deployment/passwords.sh

# Directory structure
mkdir -p /mnt/lnec/$USER/whiplash
mkdir -p /mnt/lnec/$USER/whiplash/data/db
mkdir -p /mnt/lnec/$USER/whiplash/logs
mkdir -p /mnt/lnec/$USER/whiplash/logs/mongo
mkdir -p /mnt/lnec/$USER/whiplash/logs/node
mkdir -p /mnt/lnec/$USER/whiplash/logs/rte
mkdir -p /mnt/lnec/$USER/whiplash/rte

# Python
export PYTHONPATH=$WHIPLASH_HOME/rte:$PYTHONPATH

# Node
export NODE_HOME=$HOME
export PATH=$NODE_HOME/bin:$PATH
export LD_LIBRARY_PATH=$NODE_HOME/lib:$LD_LIBRARY_PATH
export NODE_PORT=1337
export NODE_WORKERS=8
export NODE_LOG=/mnt/lnec/$USER/whiplash/logs/node/all.log

# Mongo
export MONGO_HOME=$HOME
export PATH=$MONGO_HOME/bin:$PATH
export MONGO_PORT_27017_TCP_ADDR=127.0.0.1
export MONGO_PORT_27017_TCP_PORT=27017

# Passwords
source $WHIPLASH_HOME/deployment/passwords.sh
