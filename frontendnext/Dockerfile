FROM node:18-alpine 

WORKDIR /frontendnext


# Install dependencies first (for caching)
COPY package.json package-lock.json* yarn.lock* ./


# Set build-time arg for backend URL

COPY . .

ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
# Build frontend
RUN npm install

EXPOSE 3000

# Start in production mode
CMD ["npm","run","dev"]
