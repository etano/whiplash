#!/bin/bash

export HOST="cwave.ethz.ch:27017"

echo 'Initializing WDB...'
$1 ./drivers/format_db.driver -dbhost $HOST
echo 'Committing model...'
$1 ./drivers/commit_model.driver -dbhost $HOST -path 10xx.lat -class xx -owner akosenko
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -dbhost $HOST -path apps/XXcode/xx.app -class xx -description "desc" -algorithm "algo" -version "1.0" -build "O3" -owner akosenko
echo 'Committing property...'
$1 ./drivers/commit_property.driver -dbhost $HOST -class xx -model 0 -executable 0 -owner akosenko -loops 10xx.loops
echo 'Querying property...'
$1 ./drivers/query.driver -dbhost $HOST -class xx -target cfg,energies
echo 'Querying property again...'
$1 ./drivers/worker.driver -dbhost $HOST -class xx -target cfg,energies -model_id 0
echo 'Querying property...'
$1 ./drivers/query.driver -dbhost $HOST -class xx -target cfg,energies
