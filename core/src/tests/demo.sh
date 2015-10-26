#!/bin/bash

if [ -n "${1}" ]; then
    HOST=${1}
else
    HOST="localhost:27017"
fi

echo 'Initialize the database...'
./bin/format_db.driver -dbhost $HOST
echo 'Bootstrapping the scheduler...'
./bin/scheduler.driver -dbhost $HOST &
echo 'Running demo...'
./demo.py $HOST
echo 'Killing the daemon...'
killall scheduler.driver;
