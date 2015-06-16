#!/bin/bash

echo 'Initializing WDB...'
./drivers/init_db.driver
echo 'Committing model...'
./drivers/commit_model.driver -file apps/hamil -class ising
echo 'Committing executable...'
./drivers/commit_executable.driver -file apps/test.app -class ising
echo 'Committing property...'
./drivers/commit_property.driver apps/tasks
echo 'Resolving properties...'
./drivers/resolve_properties.driver
