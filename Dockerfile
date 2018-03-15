FROM mhart/alpine-node:8.10
ADD src/package.json /app/package.json
WORKDIR /app
RUN npm install
ADD src /app
ENTRYPOINT ["node", "index.js"]
