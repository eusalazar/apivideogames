FROM node:16.15

WORKDIR /usr/src/app

COPY package*.json ./

COPY src/ ./src

RUN npm install

EXPOSE 3600

CMD ["npm", "run", "start"]