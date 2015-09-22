#!/bin/bash

# demo for the unitary evolution solver

echo 'Initializing WDB...'
$1 ./drivers/format_db.driver
echo 'Committing model...'
$1 ./drivers/commit_model.driver -path 10ue.lat -class uevol -owner akosenko
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -path apps/unitary_evolution_wrap/bin/ue_solver -class uevol -description "desc" -algorithm "algo" -version "1.0" -build "O3" -owner akosenko
echo 'Committing property...'
$1 ./drivers/commit_property.driver -class uevol -model 0 -executable 0 -owner akosenko -nsweeps 100 -hx "-1.0" -Ttot 500.0 -schedule "lin"
echo 'Bootstrapping the scheduler...'
./drivers/scheduler.driver
echo 'Querying property...'
$1 ./drivers/query.driver -class uevol -target cfg,costs

sleep 2;

echo 'Querying property again...'
$1 ./drivers/query.driver -class uevol -target cfg,costs -model_id 0
echo 'Killing the daemon...'
killall -q scheduler.driver;
