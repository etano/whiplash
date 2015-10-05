#!/bin/bash

# Mongo
docker run --name wdb-odb -v /data/db:/data/db -p localhost:27017:localhost:27017 -d mongo:latest
alias mongo="docker run -it --link wdb-odb:mongo --rm mongo sh -c 'exec mongo \"\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT\"'"

# Format database
docker run -d -P --name wdb-rte-format --link wdb-odb:mongo whiplash/rte-local:deploy sh -c "./bin/format_db.driver -dbhost \$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT"

# Commit apps
docker run -it -P --name wdb-apps --link wdb-odb:mongo whiplash/apps sh -c "sh commit_apps.sh \$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT"

# Run-time
docker run -d -P --name wdb-rte-scheduler --link wdb-odb:mongo whiplash/rte-local:deploy sh -c "./bin/scheduler.driver -dbhost \$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT"
