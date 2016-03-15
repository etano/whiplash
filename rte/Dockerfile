FROM debian:stretch
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y python3.4 python3.4-numpy
RUN mkdir -p /rte && mkdir -p /input
WORKDIR /
COPY *.py /rte/
RUN chmod 755 /rte/*.py
