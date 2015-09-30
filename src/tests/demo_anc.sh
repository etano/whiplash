#!/bin/bash

export HOST="cwave.ethz.ch:27017"

echo 'Initializing WDB...'
$1 ./drivers/format_db.driver -dbhost $HOST
echo 'Committing model...'
$1 ./drivers/commit_model.driver -dbhost $HOST -path 108ising.lat -class ising -owner akosenko -random "info"
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -dbhost $HOST -path apps/anc/an_ss_rn_fi -class ising -description "desc" -algorithm "algo" -version "1.0" -build "O3" -owner ebrown
echo 'Committing property...'
$1 ./drivers/commit_property.driver -dbhost $HOST -class ising -model_id 0 -executable_id 0 -owner akosenko -nsweeps 100000 -b0 0.1 -b1 3.0 -schedule "lin"
echo 'Bootstrapping the scheduler...'
./drivers/scheduler.driver -dbhost $HOST
echo 'Querying property...'
$1 ./drivers/query.driver -dbhost $HOST -class ising -target cfg,costs

sleep 1;

echo 'Querying property again...'
$1 ./drivers/query.driver -dbhost $HOST -class ising -target cfg,costs -model_id 0
echo 'Killing the daemon...'
killall -q scheduler.driver;
