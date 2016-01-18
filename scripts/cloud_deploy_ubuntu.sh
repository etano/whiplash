#!/bin/bash

ec2_host=$1

ssh -t ${ec2_host} 'sudo apt-get update -y'
ssh -t ${ec2_host} 'sudo yum install -y build-essential make docker.io g++ libboost-dev'
ssh -t ${ec2_host} 'sudo ln -sf /usr/bin/docker.io /usr/local/bin/docker'
ssh -t ${ec2_host} 'sed -i '$acomplete -F _docker docker' /etc/bash_completion.d/docker.io'
(cd udyn && git checkout demo)
scp -r udyn ${ec2_host}:
ssh -t ${ec2_host} 'cd udyn && make'
ssh -t ${ec2_host} 'sudo service docker start'
ssh -t ${ec2_host} 'sudo usermod -aG docker ubuntu'
ssh -t ${ec2_host} 'curl -L https://github.com/docker/compose/releases/download/1.5.2/docker-compose-Linux-x86_64 > docker-compose'
ssh -t ${ec2_host} 'chmod +x docker-compose'
ssh -t ${ec2_host} 'sudo mv docker-compose /usr/local/bin/'
scp cloud.yml ${ec2_host}:
ssh -t ${ec2_host} 'docker-compose -f cloud.yml up -d'
