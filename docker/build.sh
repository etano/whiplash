#!/bin/bash

docker run -it -P --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src; WDB_HOME=/usr/src/wdb/mount make -j4"
docker run -it -P --rm -v $PWD/../:/usr/src/wdb/mount whiplash/rte-local:build sh -c "cd mount/src/apps/; WDB_HOME=/usr/src/wdb/mount ./build_apps.sh"
