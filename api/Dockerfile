FROM node
RUN apt-get update
RUN apt-get install -y libkrb5-dev
RUN apt-get install -y python-dev libyaml-dev python-pip
RUN pip install mkdocs

# workdir
WORKDIR /src

# building node
COPY *.json /src/
RUN npm install

# copy in sources
COPY bin /src/bin
COPY mkdir /src/logs
COPY libs /src/libs
COPY docs /src/docs

# building docs
RUN mv docs/mkdocs.yml . && mkdocs build

# expose port
EXPOSE 1337
