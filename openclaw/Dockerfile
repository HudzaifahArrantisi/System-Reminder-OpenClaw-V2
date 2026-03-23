FROM node:18-alpine

WORKDIR /app

# Copy dependency files dan install
COPY package.json ./
RUN npm install --production

# Copy source code
COPY . .

CMD ["node", "index.js"]
