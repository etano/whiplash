#!/bin/bash

cp python/whiplash.py rte/
docker-compose -f cloud_build.yml build

for image in "api"
do
    docker tag -f whiplash_${image}:latest whiplash/${image}:latest
    docker push "whiplash/${image}";
done
