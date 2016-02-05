FROM node:latest
RUN apt-get update
RUN apt-get install -y libkrb5-dev

# workdir
WORKDIR /src

# building node
COPY *.json /src/
RUN npm install

# copy in sources
COPY bin /src/bin
RUN mkdir /src/logs
COPY libs /src/libs

# expose port
EXPOSE 1337
