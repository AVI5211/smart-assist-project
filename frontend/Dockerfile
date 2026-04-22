FROM node:18

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm install

COPY . .

CMD ["npm", "run", "dev", "--", "--host"]
