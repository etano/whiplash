#!/bin/bash

DBIP=$(docker-machine ip aws-odb)
docker-machine create --driver amazonec2 --amazonec2-security-group API --amazonec2-access-key AKIAII23DMY5XJZYKVYA --amazonec2-secret-key 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 --amazonec2-region eu-central-1 aws-api
eval $(docker-machine env aws-api)
docker run -d --name "whiplash-api" -e "MONGO_PORT_27017_TCP_ADDR=${DBIP}" -e "MONGO_PORT_27017_TCP_PORT=27017" -e "MONGO_API_PASSWORD=${MONGO_API_PASSWORD}" -e "USER_ADMIN_PASSWORD=${USER_ADMIN_PASSWORD}" -p 1337:1337 whiplash/api sh -c "node --use_strict bin/init_db; node --use_strict bin/create_user user_admin; node --use_strict bin/create_user test test test@test.com; node --use_strict bin/api"
