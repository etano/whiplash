FROM alpine:latest

RUN apk add --update \
        build-base \
        python \
        krb5 \
        nodejs \
    && rm -rf /var/cache/apk/*

WORKDIR /src
COPY *.json /src/
RUN npm install
COPY bin /src/bin
COPY libs /src/libs
RUN mkdir /src/logs
EXPOSE 1337
