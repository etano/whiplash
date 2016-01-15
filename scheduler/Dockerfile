FROM debian:stretch
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y python3.4 python3-pip
RUN pip3 install python-daemon
RUN mkdir -p /scheduler
WORKDIR /
COPY *.py /scheduler/
#TODO: copy whiplash.py into the scheduler directory or find another way
RUN chmod 755 /scheduler/*.py
