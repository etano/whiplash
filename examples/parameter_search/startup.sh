#!/bin/bash

docker pull yelpmoe/latest
docker run -d --name moe -v ${WDB_HOME}:/home/app/MOE/whiplashdb yelpmoe/latest
