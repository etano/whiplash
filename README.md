# Start development environment
    docker-compose -f develop.yml up -d

# restart container
docker-compose -f develop.yml restart

# access to development database
docker exec -it whiplash_odb_dev_1 mongo 127.0.0.1:27017/wdb -u pwn -p cftXzdrjheHEARuJKT39x]3sV

# check api logs
docker exec -it whiplash_api_dev_1 tail logs/all.log

# Run tests (may need to export DOCKERHOST to 192.168.99.100)
    docker-compose -f test.yml up --force-recreate -d
    sleep 5
    PYTHONPATH=$PWD/python:$PYTHONPATH python ./python/tests.py ${DOCKERHOST:?"localhost"} 7357 test test test test

# Start deployment environment
    docker-compose -f deploy.yml up -d
    
# Settings

In api/bin/www, the server.timeout is set to 1 hour. 