#!/bin/bash

docker run -it -P --name wdb-build --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src; make"
docker run -it -P --name wdb-build --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src/apps; ./build_apps.sh"

