
# Start a local environment
    docker-compose -f deployment/local/docker-compose.yml up -d

# Access the local database
    docker exec -it local_odb_1 mongo localhost:27017/wdb
