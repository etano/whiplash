#!/bin/bash

source settings.sh
docker-machine create --driver amazonec2 \
                      --amazonec2-security-group whiplash-scheduler \
                      --amazonec2-access-key ${AWS_ACCESS_KEY} \
                      --amazonec2-secret-key ${AWS_SECRET_KEY} \
                      --amazonec2-region eu-central-1 \
                      aws-scheduler
eval $(docker-machine env aws-scheduler)
docker run -d \
           --name "whiplash-scheduler" \
           -v /var/run/docker.sock:/var/run/docker.sock \
           -v /usr/bin/docker:/bin/docker \
           -v $PWD:/input \
           -e "WHIPLASH_ADMIN_PASSWORD=${WHIPLASH_ADMIN_PASSWORD}" \
           -e "WHIPLASH_HOST_WORK_DIR=$PWD" \
           -e "WHIPLASH_LAUNCH_WORK_DIR=\"/input\"" \
           -e "WHIPLASH_API_HOST=$(docker-machine ip aws-api)" \
           -e "WHIPLASH_API_PORT=1337" \
           -p 1337:1337 \
           whiplash/scheduler sh -c "node --use_strict bin/scheduler"
