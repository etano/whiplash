# Start development environment
    cd deployment/development
    docker-compose up -d

# restart container
    cd deployment/development
    docker-compose restart

# access to development database
    docker exec -it whiplash_odb_dev_1 mongo 127.0.0.1:27017/wdb -u pwn -p cftXzdrjheHEARuJKT39x]3sV

# check api logs
    docker exec -it whiplash_api_dev_1 tail logs/all.log

# Profiling

1) login as pwn
    mongo 127.0.0.1/wdb -u pwn -p cftXzdrjheHEARuJKT39x]3sV

2) set profiling level
    db.setProfilingLevel(2)

3) list the longest operations
    db.system.profile.find({},{millis : 1}).sort({millis : -1}).limit(1).pretty()
