#!/bin/bash

echo 'Initializing WDB...'
$1 ./drivers/format_db.driver
echo 'Committing model...'
$1 ./drivers/commit_model.driver -path 10xx.lat -class xx -owner akosenko
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -path apps/XXcode/xx.app -class xx -description "desc" -algorithm "algo" -version "1.0" -build "O3" -owner akosenko
echo 'Committing property...'
$1 ./drivers/commit_property.driver -class xx -model 0 -executable 0 -owner akosenko -loops 10xx.loops
echo 'Querying property...'
$1 ./drivers/query.driver -class xx -target cfg,costs
echo 'Querying property again...'
$1 ./drivers/worker.driver -class xx -target cfg,costs -model_id 0
echo 'Querying property...'
$1 ./drivers/query.driver -class xx -target cfg,costs
