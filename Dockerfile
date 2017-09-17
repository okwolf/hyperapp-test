FROM node:4-alpine
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY src /usr/src/app/src
COPY test /usr/src/app/test
CMD [ "npm", "test" ]