FROM alpine:latest

RUN apk add --update nodejs \
    && rm -rf /var/cache/apk/*

WORKDIR /src
COPY *.json /src/
COPY app.js /src/
COPY bin /src/bin
COPY views /src/views
COPY routes /src/routes
COPY public /src/public
RUN npm install
EXPOSE 3000
