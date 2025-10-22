FROM node:18-alpine

# Install dependencies for ARM64
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]