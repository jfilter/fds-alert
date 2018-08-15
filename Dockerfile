FROM node:8-alpine

ADD . /code
WORKDIR /code
COPY src /code
COPY package.json /code
RUN npm install
