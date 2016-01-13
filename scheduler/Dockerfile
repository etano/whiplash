FROM debian:stretch
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y python3.4 python3-pip
RUN pip3 install python-daemon
RUN mkdir -p /scheduler
RUN mkdir -p /python
WORKDIR /
COPY *.py /scheduler/
RUN chmod 755 /scheduler/*.py
