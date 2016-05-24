FROM alpine:latest

RUN apk add --update \
        wget \
        nodejs \
    && rm -rf /var/cache/apk/*

WORKDIR /
RUN wget --no-check-certificate https://get.docker.com/builds/Linux/x86_64/docker-1.2.0 \
    && mv docker-1.2.0 /bin/docker \
    && chmod 755 /bin/docker

WORKDIR /src
COPY *.json /src/
RUN npm install
COPY bin /src/bin
COPY libs /src/libs
RUN mkdir /src/logs
RUN mkdir /input
