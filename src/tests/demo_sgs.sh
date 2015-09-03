#!/bin/bash

echo 'Initializing WDB...'
$1 ./drivers/format_db.driver
echo 'Committing model...'
$1 ./drivers/commit_model.driver -path 108ising.lat -class ising -owner akosenko
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -path apps/spin_glass_solver/bin/main -class ising -description "desc" -algorithm "algo" -version "1.0" -build "O3" -owner akosenko
echo 'Committing property...'
$1 ./drivers/commit_property.driver -class ising -model 0 -executable 0 -owner akosenko -nsweeps 100000 -b0 0.1 -b1 3.0 -schedule "lin"
echo 'Bootstrapping the scheduler...'
./drivers/scheduler.driver
echo 'Querying property...'
$1 ./drivers/query.driver -class ising -target cfg,costs

sleep 1;

echo 'Querying property again...'
$1 ./drivers/query.driver -class ising -target cfg,costs -model_id 0
echo 'Killing the daemon...'
killall -q scheduler.driver;
