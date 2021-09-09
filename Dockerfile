FROM node:14-alpine3.10 AS build
WORKDIR /usr/src/app
COPY ["package.json", "./"]
RUN npm install
COPY . .
RUN npm run build

FROM node:14-alpine3.10
WORKDIR /usr/src/app
RUN mkdir logs
COPY ["package.json", "./"]
RUN npm install --production
COPY --from=build /usr/src/app/dist dist
EXPOSE 5000
CMD node ./dist/src/index.js
