FROM node:boron

WORKDIR /Users/shweta/documents/hr/recommendations

COPY package.json package-lock.json ./

RUN npm install sudo

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
