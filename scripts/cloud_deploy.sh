#!/bin/bash

ec2_host=$1
ssh -t ${ec2_host} 'sudo yum update -y'
ssh -t ${ec2_host} 'sudo yum install -y automake autoconf libtool* gcc-gfortran docker gcc-c++ boost lapack-devel blas-devel'
#ssh -t ${ec2_host} 'cd /usr/lib64 && sudo ln -s liblapack.so.3 liblapack.so'
scp -r udyn ${ec2_host}:
ssh -t ${ec2_host} 'wget http://sourceforge.net/projects/boost/files/boost/1.60.0/boost_1_60_0.tar.bz2 && tar -xjvf boost_1_60_0.tar.bz2 && cd udyn && make'
ssh -t ${ec2_host} 'sudo service docker start'
ssh -t ${ec2_host} 'sudo usermod -aG docker ec2-user'
ssh -t ${ec2_host} 'curl -L https://github.com/docker/compose/releases/download/1.5.2/docker-compose-Linux-x86_64 > docker-compose'
ssh -t ${ec2_host} 'chmod +x docker-compose'
ssh -t ${ec2_host} 'sudo mv docker-compose /usr/local/bin/'
scp cloud.yml ${ec2_host}:
ssh -t ${ec2_host} 'docker-compose -f cloud.yml up -d'
