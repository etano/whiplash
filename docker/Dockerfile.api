FROM node
RUN apt-get update
RUN apt-get install -y libkrb5-dev
RUN apt-get install -y python-dev libyaml-dev python-pip
RUN pip install mkdocs

COPY . /src
COPY docs /tmp/docs

# building node
RUN rm -rf /src/node_modules
RUN cd /src; npm install

# building docs
WORKDIR /tmp
RUN mv docs/mkdocs.yml . && mkdocs build

# finishing
WORKDIR /
EXPOSE 1337
