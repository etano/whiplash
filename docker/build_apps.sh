#!/bin/bash

cd ../src/apps && ../src/apps/clone_apps.sh
cd ../../docker && docker build -t whiplash/apps -f Dockerfile.apps ..
cd ../src/apps && ../src/apps/rm_apps.sh
cd ../../docker
