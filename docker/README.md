## Docker usage notes ##

# database self-contained
docker stop wdb-odb; docker rm wdb-odb
docker build -t whiplash/odb -f Dockerfile.odb .
docker run --name wdb-odb -d -p 27017:27017 whiplash/odb --auth
alias mongo="docker run -it --link wdb-odb:mongo --rm whiplash/odb sh -c 'mongo $MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT/wdb'"

# API
docker pull whiplash/api
# or build: # docker build -t whiplash/api -f Dockerfile.api ..
docker stop wdb-api; docker rm wdb-api
docker run --link wdb-odb:mongo --name wdb-api -p 1337:1337 -d -P -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/www"

# Create User
docker run -it --link wdb-odb:mongo -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/createUser.js www 7cJgeAkHdw{oktPNYdgYE3nJ"
# Create Client
docker run -it --link wdb-odb:mongo -e "MONGO_API_USERNAME=api" -e "MONGO_API_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -t whiplash/api sh -c "cd src; MONGO_URI=mongodb://\$MONGO_PORT_27017_TCP_ADDR:\$MONGO_PORT_27017_TCP_PORT/wdb node bin/createClient.js browser 32489 ha87hjlAWidwrxv435est"
# Create token
http POST http://192.168.99.100:1337/api/users/token grant_type=password client_id=www-browser client_secret=fd5834157ee2388e65ec195cd74b670570a9f4cea490444ff5c70bb4fd8243ba username=www password=7cJgeAkHdw{oktPNYdgYE3nJ

# Use token
http GET http://192.168.99.100:1337/api foo=bar access_token=



## Supplementary ##

# Alternative booting for the database (not-self-contained)

docker stop wdb-odb; docker rm wdb-odb
mkdir -p $PWD/data/db; chmod 777 $PWD/data/db
docker run --name wdb-odb -v $PWD/data/db:/data/db -p 27017:27017 -d mongo:latest
docker run -it --link wdb-odb:mongo -v $PWD:/tmp/import --rm mongo sh -c 'mongo $MONGO_PORT_27017_TCP_ADDR:$MONGO_PORT_27017_TCP_PORT/wdb /tmp/import/init_users.js'
docker stop wdb-odb; docker rm wdb-odb
docker run --name wdb-odb -v $PWD/data/db:/data/db -p 27017:27017 -d mongo:latest --auth
