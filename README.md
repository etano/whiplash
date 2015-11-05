# Start development environment
    export WHIPLASH=/path/to/whiplash
    docker-compose -f develop.yml up -d

# Run tests (may need to export DOCKERHOST to 192.168.99.100)
    docker-compose -f test.yml up --force-recreate -d
    sleep 5
    PYTHONPATH=$PWD/python:$PYTHONPATH python ./python/tests.py ${DOCKERHOST:?"localhost"} 7357 test test test test

# Start deployment environment
    docker-compose -f deploy.yml up -d
    
# Settings

In api/bin/www, the server.timeout is set to 1 hour. 