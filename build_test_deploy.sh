#!/bin/bash

# testing flags
set -e
trap 'previous_command=$this_command; this_command=$BASH_COMMAND' DEBUG
trap 'echo "exit $? : $previous_command" | mail -s "whiplash-api merge into master deployment" "ebrown@itp.phys.ethz.ch"; docker-compose -f test.yml stop;' EXIT

# build
docker-compose -f test.yml up --force-recreate -d
sleep 15

# test
PYTHONPATH=$PWD/python:$PYTHONPATH python ./python/tests.py ${DOCKERHOST:-localhost} 7357 test test test test

# cleanup
docker-compose -f test.yml stop

# deploy
docker-compose -f deploy.yml up --force-recreate -d

# turn off testing flags
set +e
trap - DEBUG
trap - EXIT
