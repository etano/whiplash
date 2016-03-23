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
RUN mkdir /src/logs
COPY libs /src/libs
EXPOSE 1337
