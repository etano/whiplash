#!/bin/bash

cd $WHIPLASH_HOME/api
node --use_strict bin/create_user admin
node --use_strict bin/create_user $USER $USER $USER@itp.phys.ethz.ch
cd $WHIPLASH_HOME
./rte/create_token.py ${HOSTNAME}.cscs.ch $NODE_PORT $USER $USER
