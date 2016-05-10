FROM node:latest

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y \
        libkrb5-dev \
        python-dev \
        python-pip \
        libyaml-dev \
    && apt-get autoremove -y
RUN pip install mkdocs

WORKDIR /src
COPY *.json /src/
RUN npm install
COPY bin /src/bin
RUN mkdir /src/logs
COPY libs /src/libs
COPY docs /src/docs
RUN mv docs/mkdocs.yml .
RUN mkdocs build
EXPOSE 80
