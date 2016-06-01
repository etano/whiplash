#!/bin/bash

{
docker-machine create --driver amazonec2 \
                      --amazonec2-security-group WhiplashApi \
                      --amazonec2-access-key ${AWS_ACCESS_KEY} \
                      --amazonec2-secret-key ${AWS_SECRET_KEY} \
                      --amazonec2-vpc-id ${AWS_VPC_ID} \
                      --amazonec2-region eu-west-1 \
                      whiplash-api-0
} && {
eval $(docker-machine env whiplash-api-0)
} && {
docker run -d \
           --name "whiplash-api" \
           -e "MONGO_PORT_27017_TCP_ADDR=${MONGO_PORT_27017_TCP_ADDR}" \
           -e "MONGO_PORT_27017_TCP_PORT=${MONGO_PORT_27017_TCP_PORT}" \
           -e "MONGO_API_PASSWORD=${MONGO_API_PASSWORD}" \
           -p 1337:1337 \
           --restart=always \
           whiplash/api sh -c "node --use_strict bin/init_db; node --use_strict bin/create_user admin ${WHIPLASH_ADMIN_PASSWORD} ${WHIPLASH_ADMIN_EMAIL}; node --use_strict bin/api"
}
