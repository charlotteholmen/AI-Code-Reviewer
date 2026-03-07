FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose both API and WebSocket ports
EXPOSE 3002 8080

# 🆕 Change from app.js to index.js
CMD ["node", "index.js"]