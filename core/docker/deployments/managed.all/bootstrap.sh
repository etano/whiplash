#!/bin/bash

# Database, web-interface and run-time are remote @ whiplash.ethz.ch
alias mongo="docker run -it --link wdb-odb:mongo --rm mongo sh -c 'exec mongo \"whiplash.ethz.ch:27017\"'"

