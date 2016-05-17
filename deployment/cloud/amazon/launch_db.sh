#!/bin/bash

docker-machine create --driver amazonec2 --amazonec2-security-group Database --amazonec2-access-key AKIAJKXKTMSZDMVWAHSQ --amazonec2-secret-key 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 --amazonec2-region eu-central-1 --amazonec2-volume-type gp2 --amazonec2-ssh-user ubuntu aws-odb
eval $(docker-machine env aws-odb)
docker-machine ssh aws-odb 'mkdir -p /home/ubuntu/data/db'
docker run -d -v /home/ubuntu/data/db:/data/db --name whiplash-odb -p 27017:27017 mongo:latest
