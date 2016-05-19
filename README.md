# Start a development environment
    docker-compose -f development/dev/docker-compose.yml up -d

# Access the development database
    docker exec -it whiplash_odb_dev_1 mongo localhost:27017/wdb
