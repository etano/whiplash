#!/bin/bash


# WDB-ODB-CONTAINER : contains mongo database
docker run --name wdb-odb -p 0.0.0.0:27017:27017 -d mongo:latest


# WDB-WWW-CONTAINER : contains web-interface for queries
docker run -d -P --name wdb-www --link wdb-odb:mongo whiplash/www:experimental


# WDB-RTE-CONTAINER : runs scheduler + workers
docker run -it -P --name wdb-rte --link wdb-odb:mongo --rm whiplash/rte-local:build
