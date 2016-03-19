#!/bin/bash

docker-machine create --driver amazonec2 --amazonec2-security-group Database --amazonec2-access-key AKIAILHRQR3JM3DER2RA --amazonec2-secret-key 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 --amazonec2-region eu-central-1 aws-odb
eval $(docker-machine env aws-odb)
docker run -d -p 27017:27017 whiplash/odb --auth
