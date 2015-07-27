#!/bin/bash

echo 'Initializing WDB...'
$1 ./drivers/init_db.driver
echo 'Committing model...'
$1 ./drivers/commit_model.driver -file apps/hamil -class ising -owner akosenko
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -file apps/test.app -class ising -description "desc" -algorithm "algo" -configuration "conf" -version "1.0" -build "O3" -owner akosenko
echo 'Committing property...'
$1 ./drivers/commit_property.driver apps/tasks
echo 'Querying property...'
$1 ./drivers/query.driver
echo 'Querying property again...'
$1 ./drivers/query.driver
