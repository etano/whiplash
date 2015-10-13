FROM node
RUN apt-get update
RUN apt-get install -y libkrb5-dev
COPY . /src
RUN rm -rf /src/node_modules
RUN cd /src; npm install
EXPOSE 1337

ENV MONGO_READWRITEUSER_USERNAME readWriteUser
ENV MONGO_READWRITEUSER_PASSWORD haYrv{Ak9UJiaDsqVTe7rLJTc
ENV MONGO_URI mongodb://localhost/wdb
