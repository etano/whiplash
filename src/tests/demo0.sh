#!/bin/bash

export HOST="cwave.ethz.ch:27017"
#export HOST=$MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT

echo 'Initializing WDB...'
$1 ./drivers/format_db.driver -dbhost $HOST
echo 'Committing model...'
$1 ./drivers/commit_model.driver -dbhost $HOST -path 108ising.lat -class ising -owner akosenko
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -dbhost $HOST -path apps/test.shared -name ez -class ising -description "desc" -algorithm "algo" -version "1.0" -build "O3" -owner akosenko
echo 'Committing properties...'
$1 ./drivers/commit_property.driver -dbhost $HOST -class ising -model_id 0 -executable_id 0 -owner akosenko -n_sweeps 10 -reps 10
echo 'Querying properties...'
$1 ./drivers/query.driver -dbhost $HOST -class ising -target cfg,costs
echo 'Bootstrapping the scheduler...'
./drivers/scheduler.driver -dbhost $HOST
sleep 3;
echo 'Querying properties again...'
$1 ./drivers/query.driver -dbhost $HOST -class ising -target cfg,costs
echo 'Killing the daemon...'
killall scheduler.driver;
