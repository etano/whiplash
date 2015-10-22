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
