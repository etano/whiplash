FROM alpine:latest

RUN apk add --update \
        python3 \
    && rm -rf /var/cache/apk/*

RUN mkdir -p /exec && mkdir -p /data
WORKDIR /exec
COPY runner.py /exec/
RUN chmod 755 /exec/runner.py
ENTRYPOINT ["/exec/runner.py"]
