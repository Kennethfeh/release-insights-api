FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run lint && npm test

FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production PORT=4100
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/server.js ./server.js
EXPOSE 4100
CMD ["node", "server.js"]
