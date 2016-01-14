#!/bin/bash

cp python/whiplash.py scheduler/
docker-compose -f develop.yml build

for image in "scheduler" "api" "odb" "www"
do
    docker tag whiplash_${image}_dev:latest whiplash/${image}:latest
    docker push "whiplash/${image}";
done
