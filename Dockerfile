FROM node:16

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install
RUN npm rebuild bcrypt --build-from-source

COPY . ./

CMD ["yarn", "start:migrate:prod"]
