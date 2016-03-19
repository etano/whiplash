#!/bin/bash

ec2_host=$1
ssh -t ${ec2_host} 'sudo apt-get update -y'
ssh -t ${ec2_host} 'sudo apt-get install -y build-essential make g++ libboost-dev liblapack-dev libblas-dev libgfortran3 libgfortran-4.8-dev'
scp -r ${HOME}/src/udyn ${ec2_host}:
ssh -t ${ec2_host} 'cd udyn && make clean && make'
ssh -t ${ec2_host} 'wget -qO- https://get.docker.com/ | sh'
ssh -t ${ec2_host} 'sudo usermod -aG docker ubuntu'
ssh -t ${ec2_host} 'sudo service docker start'
ssh -t ${ec2_host} 'curl -L https://github.com/docker/compose/releases/download/1.5.2/docker-compose-Linux-x86_64 > docker-compose'
ssh -t ${ec2_host} 'chmod +x docker-compose'
ssh -t ${ec2_host} 'sudo mv docker-compose /usr/local/bin/'
scp cloud.yml ${ec2_host}:
ssh -t ${ec2_host} 'docker login -u iliazin -p whipass -e iliazin@gmail.com'
ssh -t ${ec2_host} 'docker-compose -f cloud.yml up -d'
ssh -t ${ec2_host} 'mkdir -p logs && mkdir -p logs/users'
ssh -t ${ec2_host} 'python3 rte/create_token.py localhost 1337 test test'
ssh -t ${ec2_host} 'python3 rte/manager.py --local --host localhost --port 1337 --num_cpus 8'
