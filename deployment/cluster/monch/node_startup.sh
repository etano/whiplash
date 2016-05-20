#!/bin/bash

module load gcc/4.8.1
cd $WHIPLASH_HOME/api
npm install
node --use_strict bin/init_db
node --use_strict bin/create_user admin $ADMIN_PASSWORD admin@whiplash.ethz.ch
node --use_strict bin/create_user $USER $USER $USER@itp.phys.ethz.ch
node --use_strict bin/api > /dev/null 2>&1 &
