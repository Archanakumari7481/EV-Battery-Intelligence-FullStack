# This Dockerfile lives at the REPOSITORY ROOT (required by Back4app),
# but it builds and runs the Node.js backend that lives in the /backend subfolder.

FROM node:18-alpine

WORKDIR /app

# Install backend dependencies first (better build caching)
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY backend/ .

EXPOSE 5000

CMD ["node", "server.js"]