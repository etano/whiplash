#!/bin/bash

docker-machine --native-ssh create --driver amazonec2 --amazonec2-security-group Database --amazonec2-access-key AKIAILHRQR3JM3DER2RA --amazonec2-secret-key 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 --amazonec2-region eu-central-1 --amazonec2-volume-type gp2 --amazonec2-ssh-keypath /Users/ethan/.ssh/id_rsa aws-odb
eval $(docker-machine env aws-odb)
docker run -d -v /home/ubuntu:/data/db --name whiplash-odb -p 27017:27017 mongo:latest
docker-machine --native-ssh scp ../../../odb/startup.js aws-odb:~/
docker exec -it whiplash-odb mongo 127.0.0.1/wdb /data/db/startup.js
docker rm -f whiplash-odb
docker-machine --native-ssh ssh aws-odb 'rm ~/startup.js'
docker run -d -v /home/ubuntu:/data/db --name whiplash-odb -p 27017:27017 mongo:latest --auth
