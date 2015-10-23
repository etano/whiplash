#!/bin/bash

# testing flags
set -e
trap 'previous_command=$this_command; this_command=$BASH_COMMAND' DEBUG
trap 'echo "exit $? : $previous_command" | mail -s "whiplash-api merge into master deployment" "ebrown@itp.phys.ethz.ch"; ./cleanup.sh;' EXIT

#
# BUILD
#

docker build -t whiplash/odb -f Dockerfile.odb .
docker build -t whiplash/api -f Dockerfile.api ..

#
# TEST
#

# start test environment
./development_startup.sh

# tests
git clone git@gitlab.phys.ethz.ch:whiplash/whiplash-python.git
PYTHONPATH=$PWD/whiplash-python:$PYTHONPATH ./whiplash-python/tests.py localhost 7357 www 7cJgeAkHdw{oktPNYdgYE3nJ 32489 ha87hjlAWidwrxv435est

# cleanup
./cleanup.sh

#
# PUSH
#

docker push whiplash/odb
docker push whiplash/api

# turn off testing
set +e
trap - DEBUG
trap - EXIT

#
# DEPLOY
#

./deploy.sh 2
