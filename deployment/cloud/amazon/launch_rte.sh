#!/bin/bash

source settings.sh
docker-machine create --driver amazonec2 \
                      --amazonec2-security-group whiplash-rte \
                      --amazonec2-access-key ${AWS_ACCESS_KEY} \
                      --amazonec2-secret-key ${AWS_SECRET_KEY} \
                      --amazonec2-region eu-central-1 \
                      aws-rte
eval $(docker-machine env aws-rte)
docker run -d \
           --name "whiplash-rte" \
           -v /var/run/docker.sock:/var/run/docker.sock \
           -v /usr/bin/docker:/bin/docker \
           -v $PWD:/input \
           -e "AWS_ACCESS_KEY=${AWS_ACCESS_KEY}" \
           -e "AWS_SECRET_KEY=${AWS_SECRET_KEY}" \
           -e "ADMIN_PASSWORD=${ADMIN_PASSWORD}" \
           -e "WORKDIR=$PWD" \
           -p 1337:1337 \
           whiplash/rte sh -c "./rte/manager.py --cloud --host $(docker-machine ip aws-api) --port 1337 --verbose --docker"
