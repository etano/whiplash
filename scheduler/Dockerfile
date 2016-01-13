FROM debian:wheezy
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y python
RUN mkdir -p /scheduler
WORKDIR /scheduler
COPY scheduler/*.py /scheduler/
