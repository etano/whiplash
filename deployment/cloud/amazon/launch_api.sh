#!/bin/bash

DBIP=$(docker-machine ip aws-odb)
docker-machine create --driver amazonec2 --amazonec2-security-group API --amazonec2-access-key AKIAILHRQR3JM3DER2RA --amazonec2-secret-key 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 --amazonec2-region eu-central-1 aws-api
eval $(docker-machine env aws-api)
docker run -d -e "MONGO_PORT_27017_TCP_ADDR=${DBIP}" -e "MONGO_PORT_27017_TCP_PORT=27017" -p 1337:1337 whiplash/api sh -c "node --use_strict bin/init_db; node --use_strict bin/create_user user_admin; node --use_strict bin/create_user test test test@test.com; node --use_strict bin/api"
