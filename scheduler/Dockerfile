FROM alpine:latest

RUN apk add --update \
        curl \
        nodejs \
    && rm -rf /var/cache/apk/*

ENV DOCKER_BUCKET get.docker.com
ENV DOCKER_VERSION 1.11.1
ENV DOCKER_SHA256 893e3c6e89c0cd2c5f1e51ea41bc2dd97f5e791fcfa3cee28445df277836339d

RUN set -x \
        && curl -fSL "https://${DOCKER_BUCKET}/builds/Linux/x86_64/docker-$DOCKER_VERSION.tgz" -o docker.tgz \
        && echo "${DOCKER_SHA256} *docker.tgz" | sha256sum -c - \
        && tar -xzvf docker.tgz \
        && mv docker/* /bin/ \
        && chmod 755 /bin/docker \
        && rmdir docker \
        && rm docker.tgz \
        && docker -v

WORKDIR /src
COPY *.json /src/
RUN npm install
COPY bin /src/bin
COPY libs /src/libs
RUN mkdir /src/logs
RUN mkdir /input
