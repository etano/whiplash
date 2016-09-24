
# Start a local environment
    docker-compose -f deployment/local/docker-compose.yml up -d

# Access the local database
    docker exec -it local_odb_1 mongo localhost:27017/wdb

# Set up local RTE
    export WHIPLASH_HOME=$HOME/src/whiplash
    mkdir -p $WHIPLASH_HOME/logs/rte
    mkdir -p $WHIPLASH_HOME/logs/work
    export WORKDIR=$WHIPLASH_HOME/logs/work
    export ADMIN_PASSWORD=password

# Run the local RTE
    $WHIPLASH_HOME/rte/manager.py --host localhost --port 1337 --num_cpus 2 --log_dir $WHIPLASH_HOME/logs/rte/ --rte_dir $WHIPLASH_HOME/rte --docker
