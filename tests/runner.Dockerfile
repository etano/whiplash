FROM debian:stretch
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y python3.4 python3.4-numpy
RUN mkdir -p /exec && mkdir -p /data
WORKDIR /exec
COPY runner.py /exec/
RUN chmod 755 /exec/runner.py
ENTRYPOINT ["/exec/runner.py"]
