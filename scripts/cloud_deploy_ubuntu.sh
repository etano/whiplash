#!/bin/bash

ec2_host=$1
SRCDIR=${HOME}/src
ssh -t ${ec2_host} 'sudo apt-get update -y'
ssh -t ${ec2_host} 'sudo apt-get install -y build-essential make g++ python3-pip'
ssh -t ${ec2_host} 'sudo apt-get install -y python-numpy'
scp -r rte ${ec2_host}:
ssh -t ${ec2_host} 'mkdir -p python'
scp ${SRCDIR}/whiplash/python/whiplash.py ${ec2_host}:python/
scp -r ${SRCDIR}/tsp_ising_mapper ${ec2_host}:
ssh -t ${ec2_host} 'chmod 755 tsp_ising_mapper/tsp_ising_mapper.py'
scp -r ${SRCDIR}/spins2route ${ec2_host}:
ssh -t ${ec2_host} 'chmod 755 spins2route/spins2route.py'
(cd DT-SQA && git checkout demo)
scp -r ${SRCDIR}/DT-SQA ${ec2_host}:
ssh -t ${ec2_host} 'cd DT-SQA && make clean && make'
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
