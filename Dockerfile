FROM node:0.10-onbuild
COPY . /src
RUN cd /src; npm install
EXPOSE 1337
