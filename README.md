
# Start a development environment
    docker-compose -f deployment/dev/docker-compose.yml up -d

# Access the development database
    docker exec -it dev_odb_1 mongo localhost:27017/wdb
