#!/bin/bash

# ${1} - API ip

docker-machine create --driver amazonec2 --amazonec2-security-group RTE --amazonec2-access-key AKIAILHRQR3JM3DER2RA --amazonec2-secret-key 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 --amazonec2-region eu-central-1 aws-rte
eval $(docker-machine env aws-rte)
docker run -d -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/bin/docker -v $PWD:/input -p 1337:1337 whiplash/rte sh -c "./rte/create_token.py ${1} 1337 test test && ./rte/manager.py --local --host ${1} --port 1337 --verbose --docker"
