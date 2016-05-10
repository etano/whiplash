#!/bin/bash

docker-machine create --driver amazonec2 --amazonec2-security-group Database --amazonec2-access-key AKIAII23DMY5XJZYKVYA --amazonec2-secret-key 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 --amazonec2-region eu-central-1 --amazonec2-volume-type gp2 --amazonec2-ssh-user ubuntu aws-odb
eval $(docker-machine env aws-odb)
docker-machine ssh aws-odb 'mkdir -p /home/ubuntu/data/db'
docker run -d -v /home/ubuntu/data/db:/data/db --name whiplash-odb -p 27017:27017 mongo:latest
