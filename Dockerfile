FROM node:11

ARG hostname=hostname

RUN apt-get update
RUN apt-get install -y \
	libx11-xcb1 \
	libxtst6 \
	libnss3 \
	libxss1 \
	libasound2 \
	libatk-bridge2.0-0 \
	libgtk-3-0
RUN rm -rf /var/lib/apt/lists/*

ENV HOSTNAME=${hostname}

RUN mkdir /opt/src
WORKDIR /opt/src

VOLUME [ "/opt/src/data" ]

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "start" ]
