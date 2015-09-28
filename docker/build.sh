#!/bin/bash

docker run -it -P --name wdb-build --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src; WDB_HOME=/usr/src/wdb/mount make"
docker run -it -P --name wdb-build --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src/apps; WDB_HOME=/usr/src/wdb/mount ./build_apps.sh"

