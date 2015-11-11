#!/bin/bash

# Bash
export PS1="[\u@\h \W]\$"
export SQUEUE_FORMAT="%10i %12u %12a %.16j %.20P %.3t %.15r %.12e %.10L %.10l %.4D %.9Q"

# Modules
module load python/3.4.1-gcc-4.8.1
module load git

# Python
export PYTHONPATH=/users/whiplash/python_packages:/users/whiplash/whiplash/python:$PYTHONPATH

# Node
export NODE_HOME=/users/whiplash/node-v4.2.2-linux-x64
export PATH=$NODE_HOME/bin:$PATH
export LD_LIBRARY_PATH=$NODE_HOME/lib:$LD_LIBRARY_PATH

# Mongo
export MONGO_HOME=/users/whiplash/mongodb-linux-x86_64-3.0.7
export PATH=$MONGO_HOME/bin:$PATH
export DB_PATH=/store/p501/whiplash/data/db
export LOG_PATH=/store/p501/whiplash/logs
export MONGO_API_USERNAME=api
export MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc
export MONGO_PORT_27017_TCP_ADDR=localhost
export MONGO_PORT_27017_TCP_PORT=27017

# Aliases
alias mongod="/users/whiplash/mongodb-linux-x86_64-3.0.7/bin/mongod"
alias mongo="/users/whiplash/mongodb-linux-x86_64-3.0.7/bin/mongo"
alias node="/users/whiplash/node-v4.2.2-linux-x64/bin/node"