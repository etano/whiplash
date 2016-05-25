#!/bin/bash

for image in "api" "scheduler" "www"
do
    docker-compose -f ../../${image}/docker-compose.yml build
    docker tag -f ${image}_${image}:latest whiplash/${image}:latest
    docker push "whiplash/${image}";
done
