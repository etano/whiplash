# Build
docker build -t whiplash/api -f Dockerfile ..

# Push
docker push whiplash/api

# Run
docker run --name wdb-api -p 1337:1337 -e "MONGO_URI=mongodb://whiplash.ethz.ch:27017/wdb" -e "MONGO_READWRITEUSER_USERNAME=readWriteUser" -e "MONGO_READWRITEUSER_PASSWORD=haYrv{Ak9UJiaDsqVTe7rLJTc" -d -t whiplash/api sh -c "cd src; node bin/www"
