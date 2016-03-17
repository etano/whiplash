FROM debian:stretch
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y python3.4 python3.4-numpy
RUN apt-get install -y wget
RUN wget https://get.docker.com/builds/Linux/x86_64/docker-1.2.0
RUN mv docker-1.2.0 /bin/docker
RUN chmod 755 /bin/docker
RUN mkdir -p /rte && mkdir -p /input
WORKDIR /
COPY *.py /rte/
RUN chmod 755 /rte/*.py
