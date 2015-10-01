#!/bin/bash

export HOST=$MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT

./drivers/format_db.driver -dbhost $HOST
./drivers/commit_model.driver -dbhost $HOST -path 108ising.lat -class ising -owner akosenko
./drivers/commit_executable.driver -dbhost $HOST -path apps/test.shared -name ez -class ising -description "desc" -algorithm "algo" -version "1.0" -build "O3" -owner akosenko
./drivers/commit_property.driver -dbhost $HOST -class ising -model_id 0 -executable_id 0 -owner akosenko -n_sweeps 10 -reps 10
sleep 3;
./drivers/query.driver -dbhost $HOST -class ising -target cfg,costs
