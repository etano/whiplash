#!/bin/bash

echo 'Initializing WDB...'
$1 ./drivers/init_db.driver
echo 'Committing model...'
$1 ./drivers/commit_model.driver -file apps/hamil -class ising
echo 'Committing executable...'
$1 ./drivers/commit_executable.driver -file apps/test.app -class ising
echo 'Committing property...'
$1 ./drivers/commit_property.driver apps/tasks
echo 'Resolving properties...'
$1 ./drivers/resolve_properties.driver
