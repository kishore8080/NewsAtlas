FROM node:18-alpine AS builder

WORKDIR /frontendnext

COPY /frontendnext .

# Install dependencies first (for caching)
# COPY package.json package-lock.json* yarn.lock* ./
RUN npm install || yarn install

EXPOSE 3000

CMD ["npm", "run", "dev"]