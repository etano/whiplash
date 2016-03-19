#!/bin/bash

DBIP=$(docker-machine ip aws-odb)
docker-machine create --driver amazonec2 --amazonec2-security-group API --amazonec2-access-key AKIAILHRQR3JM3DER2RA --amazonec2-secret-key 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 --amazonec2-region eu-central-1 aws-api
eval $(docker-machine env aws-api)
docker run -d -e "MONGO_PORT_27017_TCP_ADDR=${DBIP}" -e "MONGO_PORT_27017_TCP_PORT=27017" -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -p 1337:1337 whiplash/api sh -c "node --use_strict bin/createUser.js test test test@test.com; node --use_strict bin/createClient.js test-python test-python test; node --use_strict bin/createClient.js test-scheduler test-scheduler test; node --use_strict bin/createUser.js scheduler c93lbcp0hc[5209sebf10{3ca scheduler@whiplash.ethz.ch; node --use_strict bin/createClient.js scheduler scheduler-python c93lbcp0hc[5209sebf10{3ca; node --use_strict bin/api"
