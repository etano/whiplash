#!/bin/bash

if [ $# -eq 0 ]
  then
    echo "Please supply an index as the first argument"
    exit 1
fi
INDEX=$1

{
docker-machine create --driver amazonec2 \
                      --amazonec2-security-group WhiplashScheduler \
                      --amazonec2-access-key ${AWS_ACCESS_KEY} \
                      --amazonec2-secret-key ${AWS_SECRET_KEY} \
                      --amazonec2-vpc-id ${AWS_VPC_ID} \
                      --amazonec2-region eu-west-1 \
                      whiplash-scheduler-${INDEX}
} && {
eval $(docker-machine env whiplash-scheduler-${INDEX})
} && {
docker run -d \
           --name "whiplash-scheduler" \
           -v /var/run/docker.sock:/var/run/docker.sock \
           -v $PWD:/input \
           -e "WHIPLASH_ADMIN_SCHEDULER_CLIENT_ID=admin-scheduler" \
           -e "WHIPLASH_ADMIN_SCHEDULER_CLIENT_SECRET=${WHIPLASH_ADMIN_PASSWORD}" \
           -e "WHIPLASH_ADMIN_PASSWORD=${WHIPLASH_ADMIN_PASSWORD}" \
           -e "WHIPLASH_HOST_WORK_DIR=$PWD" \
           -e "WHIPLASH_LAUNCH_WORK_DIR=/input" \
           -e "WHIPLASH_API_HOST=$(docker-machine ip whiplash-api-0)" \
           -e "WHIPLASH_API_PORT=1337" \
           -p 1337:1337 \
           --restart=always \
           whiplash/scheduler sh -c "node --use_strict bin/scheduler"
}
