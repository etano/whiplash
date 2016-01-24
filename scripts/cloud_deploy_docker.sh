#!/bin/bash

ec2_host=$1
ssh -t ${ec2_host} 'wget -qO- https://get.docker.com/ | sh'
ssh -t ${ec2_host} 'sudo usermod -aG docker ubuntu'
ssh -t ${ec2_host} 'sudo service docker start'
ssh -t ${ec2_host} 'curl -L https://github.com/docker/compose/releases/download/1.5.2/docker-compose-Linux-x86_64 > docker-compose'
ssh -t ${ec2_host} 'chmod +x docker-compose'
ssh -t ${ec2_host} 'sudo mv docker-compose /usr/local/bin/'
scp cloud_docker.yml ${ec2_host}:
ssh -t ${ec2_host} 'export DOCKER_PATH=$(which docker) && docker-compose -f cloud_docker.yml up -d'
