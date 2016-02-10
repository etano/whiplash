#!/bin/bash

# Modules
module load python/3.4.1-gcc-4.8.1
module load git

# Python
export PYTHONPATH=/users/ebrown/src/whiplash/python:$PYTHONPATH

# Node
export NODE_HOME=$HOME
export PATH=$NODE_HOME/bin:$PATH
export LD_LIBRARY_PATH=$NODE_HOME/lib:$LD_LIBRARY_PATH
export NWORKERS=8
export LOGPATH=/mnt/lnec/ebrown/logs/node/all.log

# Mongo
export PATH=/users/ebrown/src/mongodb-linux-x86_64-3.2.1/bin:$PATH
export MONGO_API_USERNAME=api
export MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc
export MONGO_PORT_27017_TCP_ADDR=localhost
export MONGO_PORT_27017_TCP_PORT=27017
