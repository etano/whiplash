#!/bin/bash

docker-compose -f cloud_build.yml build

for image in "odb" "api" "rte"
do
    docker tag -f whiplash_${image}:latest whiplash/${image}:latest
    docker push "whiplash/${image}";
done
