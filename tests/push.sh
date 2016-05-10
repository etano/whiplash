#!/bin/bash

docker-compose build
for image in "sleeper" "runner"
do
    docker tag -f tests_${image}:latest whiplash/${image}:latest
    docker push "whiplash/${image}";
done
