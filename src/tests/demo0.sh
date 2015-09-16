#!/bin/bash

echo 'Initializing WDB...'
$1 ./drivers/format_db.driver
echo 'Committing model...'
$1 ./drivers/commit_model.driver -path 108ising.lat -class ising -owner akosenko
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -path apps/test.app -class ising -description "desc" -algorithm "algo" -version "1.0" -build "O3" -owner akosenko
echo 'Committing property...'

ns=10
seed=0

#for ns in 1 10 100 1000 10000
for seed in {0..9}
do
    $1 ./drivers/commit_property.driver -class ising -model 0 -executable 0 -owner akosenko -n_sweeps ${ns} -seed ${seed}
done
echo 'Bootstrapping the scheduler...'
./drivers/scheduler.driver
#echo 'Querying property...'
#$1 ./drivers/query.driver -class ising -target cfg,costs

sleep 10;

echo 'Querying property again...'
#$1 ./drivers/query.driver -class ising -target cfg,costs -model_id 0
$1 ./drivers/query.driver -class ising -target cfg,costs
echo 'Killing the daemon...'
killall -q scheduler.driver;
