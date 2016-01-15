#!/bin/bash

ec2_host=$1
scp cloud.yml ec2-user@${ec2_host}:
ssh ec2-user@${ec2_host} 'sudo yum update -y'
ssh ec2-user@${ec2_host} 'sudo yum install -y docker'
ssh ec2-user@${ec2_host} 'sudo service docker start'
ssh ec2-user@${ec2_host} 'sudo usermod -aG docker ec2-user'
ssh ec2-user@${ec2_host} 'curl -L https://github.com/docker/compose/releases/download/1.5.2/docker-compose-Linux-x86_64 > docker-compose'
ssh ec2-user@${ec2_host} 'chmod +x docker-compose'
ssh ec2-user@${ec2_host} 'sudo mv docker-compose /usr/local/bin/'
ssh ec2-user@${ec2_host} 'docker-compose -f cloud.yml up -d'
