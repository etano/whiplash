FROM alpine:latest

RUN apk add --update \
        nodejs \
        wget \
    && rm -rf /var/cache/apk/*

WORKDIR /
RUN wget --no-check-certificate https://get.docker.com/builds/Linux/x86_64/docker-1.2.0 \
    && mv docker-1.2.0 /bin/docker \
    && chmod 755 /bin/docker
RUN mkdir -p /input

WORKDIR /src
COPY package.json /src/
RUN npm install
COPY bin /src/bin
COPY libs /src/libs
EXPOSE 3000
