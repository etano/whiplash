#!/bin/bash

source settings.sh
docker-machine create --driver amazonec2 \
                      --amazonec2-security-group whiplash-api \
                      --amazonec2-access-key ${AWS_ACCESS_KEY} \
                      --amazonec2-secret-key ${AWS_SECRET_KEY} \
                      --amazonec2-region eu-central-1 \
                      aws-api
eval $(docker-machine env aws-api)
docker run -d \
           --name "whiplash-api" \
           -e "MONGO_PORT_27017_TCP_ADDR=${MONGO_PORT_27017_TCP_ADDR}" \
           -e "MONGO_PORT_27017_TCP_PORT=${MONGO_PORT_27017_TCP_PORT}" \
           -e "MONGO_API_PASSWORD=${MONGO_API_PASSWORD}" \
           -e "ADMIN_PASSWORD=${ADMIN_PASSWORD}" \
           -p 1337:1337 \
           whiplash/api sh -c "node --use_strict bin/init_db; node --use_strict bin/create_user admin; node --use_strict bin/create_user test test test@test.com; node --use_strict bin/api"
