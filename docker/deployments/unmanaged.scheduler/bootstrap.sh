#!/bin/bash

# Run-time (scheduler)
docker run -d -P --name wdb-rte --link wdb-odb:mongo whiplash/rte-local:deploy sh -c "./bin/scheduler.driver -dbhost whiplash.ethz.ch:27017"

# Database and web-interface are remote @ whiplash.ethz.ch
alias mongo="docker run -it --link wdb-odb:mongo --rm mongo sh -c 'exec mongo \"whiplash.ethz.ch:27017\"'"
