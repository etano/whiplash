#!/bin/bash

cp python/whiplash.py scheduler/
docker-compose -f cloud_build.yml build

for image in "scheduler" "api" "odb"
do
    docker tag whiplash_${image}:latest whiplash/${image}:latest
    docker push "whiplash/${image}";
done
