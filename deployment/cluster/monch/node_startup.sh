#!/bin/bash

module load gcc/4.8.1
cd $WHIPLASH_HOME/api
npm install
node --use_strict bin/api > /dev/null 2>&1 &
