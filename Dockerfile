FROM node:6.9.1

RUN mkdir /tenk-time/

WORKDIR /tenk-time/

ADD . /tenk-time/

RUN npm install

EXPOSE 4000

CMD ["npm","start"]