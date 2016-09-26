# Project Whiplash

Project whiplash was created for the purpose of automatically generating and running a massive amount of individual simulations.

# Deployment

## Local

A local deployment is meant to run on a user's personal computer or single node.

### Requirements

- Docker (http://www.docker.com/)

### Installation

    curl -L https://github.com/docker/compose/releases/download/1.8.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    docker-compose -f deployment/local/docker-compose.yml up -d

### Test

    export PYTHONPATH=$PWD/rte:$PYTHONPATH
    ./tests/pre-tests.py localhost 1337
    sleep 60
    ./tests/post-tests.py localhost 1337

### Usage



### Database access

    docker exec -it local_odb_1 mongo localhost:27017/wdb

# Set up local RTE
    export WHIPLASH_HOME=$HOME/src/whiplash
    mkdir -p $WHIPLASH_HOME/logs/rte
    mkdir -p $WHIPLASH_HOME/logs/work
    export WORKDIR=$WHIPLASH_HOME/logs/work
    export ADMIN_PASSWORD=password

# Run the local RTE
    $WHIPLASH_HOME/rte/manager.py --host localhost --port 1337 --num_cpus 2 --log_dir $WHIPLASH_HOME/logs/rte/ --rte_dir $WHIPLASH_HOME/rte --docker
