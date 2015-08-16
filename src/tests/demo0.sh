#!/bin/bash

echo 'Initializing WDB...'
$1 ./drivers/format_db.driver
echo 'Committing model...'
$1 ./drivers/commit_model.driver -path apps/108problem.lat -class ising -owner akosenko
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -path apps/test.app -class ising -description "desc" -algorithm "algo" -version "1.0" -build "O3" -owner akosenko
echo 'Committing property...'
$1 ./drivers/commit_property.driver -class ising -model 0 -executable 0 -owner akosenko -n_sweeps 7
echo 'Querying property...'
$1 ./drivers/query.driver -class ising -target cfg,costs
echo 'Querying property again...'
$1 ./drivers/query.driver -class ising -target cfg,costs -model_id 0
