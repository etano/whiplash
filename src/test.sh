#!/bin/bash

echo 'Initializing WDB...'
./drivers/init_db.driver
echo 'Committing model...'
./drivers/commit_model.driver -file apps/hamil -class ising
echo 'Committing property...'
./drivers/commit_property.driver apps/tasks
echo 'Fetching model...'
./drivers/fetch_model.driver
echo 'Fetching property...'
./drivers/fetch_property.driver
echo 'Resolving properties...'
./drivers/resolve_properties.driver
