#!/bin/bash

for image in "odb" "api" "rte"
do
    docker-compose -f ../../${image}/docker-compose.yml build
    docker tag -f whiplash_${image}:latest whiplash/${image}:latest
    docker push "whiplash/${image}";
done
