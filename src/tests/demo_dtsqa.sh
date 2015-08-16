#!/bin/bash

echo 'Initializing WDB...'
$1 ./drivers/init_db.driver
echo 'Committing model...'
$1 ./drivers/commit_model.driver -path 108problem.lat -class ising -owner akosenko -random "info"
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -path apps/DT-SQA/dtsqa -class ising -description "desc" -algorithm "algo" -version "1.0" -build "O3" -owner ebrown
echo 'Committing property...'
$1 ./drivers/commit_property.driver -class ising -model 0 -executable 0 -owner akosenko -nsweeps 10000 -T_0 0.05  -T_1 0.05 -schedule "lin" -nslices 50 -gamma_0 2.5 -gamma_1 0
echo 'Querying property...'
$1 ./drivers/query.driver -class ising -target cfg,costs
echo 'Querying property again...'
$1 ./drivers/query.driver -class ising -target cfg,costs -model_id 0
