#!/bin/bash

docker build -t whiplash/api -f Dockerfile .
docker push whiplash/api
