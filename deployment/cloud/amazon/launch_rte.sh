#!/bin/bash

APIIP=$(docker-machine ip aws-api)
docker-machine create --driver amazonec2 --amazonec2-security-group RTE --amazonec2-access-key AKIAII23DMY5XJZYKVYA --amazonec2-secret-key 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 --amazonec2-region eu-central-1 aws-rte
eval $(docker-machine env aws-rte)
docker run -d --name "whiplash-rte" -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/bin/docker -v $PWD:/input -e "USER_ADMIN_PASSWORD=${USER_ADMIN_PASSWORD}" -e "WORKDIR=$PWD" -p 1337:1337 whiplash/rte sh -c "./rte/manager.py --cloud --host ${APIIP} --port 1337 --verbose --docker"
