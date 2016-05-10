FROM alpine:latest

RUN apk add --update \
        python3 \
    && rm -rf /var/cache/apk/*

RUN mkdir -p /exec && mkdir -p /data
WORKDIR /exec
COPY sleeper.py /exec/
RUN chmod 755 /exec/sleeper.py
ENTRYPOINT ["/exec/sleeper.py"]
