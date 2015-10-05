#!/bin/bash

docker pull yelpmoe/latest
docker run -d --name moe -v ${WDB_HOME}/whiplashdb:/home/app/MOE/whiplashdb yelpmoe/latest
docker exec -it moe sh -c "cd whiplashdb && python test.py"
