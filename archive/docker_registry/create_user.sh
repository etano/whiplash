#!/bin/bash

username=$1
password=$2

docker-compose stop
docker run --entrypoint htpasswd registry:2 -Bbn ${username} ${password} >> auth/htpasswd
docker-compose up -d
