FROM node:0.10-onbuild
COPY . /src
RUN cd /src; npm install
EXPOSE 1337
RUN source environment.sh
RUN rm environment.sh
