#!/bin/bash

echo 'Initializing WDB...'
$1 ./drivers/format_db.driver
echo 'Committing model...'
$1 ./drivers/commit_model.driver -path 108problem.lat -class ising -owner akosenko -random "info"
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -path apps/anc/an_ss_rn_fi -class ising -description "desc" -algorithm "algo" -version "1.0" -build "O3" -owner ebrown
echo 'Committing property...'
$1 ./drivers/commit_property.driver -class ising -model 0 -executable 0 -owner akosenko -nsweeps 100000 -b0 0.1 -b1 3.0 -schedule "lin"
echo 'Querying property...'
$1 ./drivers/query.driver -class ising -target cfg,costs
echo 'Querying property again...'
$1 ./drivers/query.driver -class ising -target cfg,costs -model_id 0
