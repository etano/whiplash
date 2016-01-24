#!/bin/bash

cp python/whiplash.py scheduler/
docker-compose -f cloud_build.yml build

for image in "odb" "api" "scheduler"
do
    docker tag -f whiplash_${image}:latest whiplash/${image}:latest
    #docker push "whiplash/${image}";
done
