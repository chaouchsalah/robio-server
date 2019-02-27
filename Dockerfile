FROM node:10.14.2
RUN mkdir -p /src/app
WORKDIR /src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . /src/app
EXPOSE 3000
CMD [ "yarn", "start" ]