#!/bin/bash

docker build -t whiplash/www:experimental -f Dockerfile.www ..
docker push whiplash/www

docker build -t whiplash/rte-local:deploy -f Dockerfile.deploy ..
docker push whiplash/rte-local

