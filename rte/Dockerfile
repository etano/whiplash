FROM alpine:latest

RUN apk add --update \
        python3 \
        wget \
    && rm -rf /var/cache/apk/*

WORKDIR /
RUN wget --no-check-certificate https://get.docker.com/builds/Linux/x86_64/docker-1.2.0 \
    && mv docker-1.2.0 /bin/docker \
    && chmod 755 /bin/docker
RUN mkdir -p /rte \
    && mkdir -p /input
COPY *.py /rte/
RUN chmod 755 /rte/*.py
