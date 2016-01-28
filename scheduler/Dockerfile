FROM debian:stretch
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y python3
RUN mkdir -p /scheduler && mkdir -p /host
WORKDIR /
COPY *.py /scheduler/
#TODO: copy whiplash.py into the scheduler directory or find another way
RUN chmod 755 /scheduler/*.py
