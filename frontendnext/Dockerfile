# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /frontendnext

# Copy dependency files first (for caching)
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install

# Copy the full project
COPY . .

# Build the Next.js app
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:18-alpine

WORKDIR /frontendnext

# Copy only necessary files from builder
# Copy entire project from builder (not just build artifacts)
COPY --from=builder /frontendnext /frontendnext

# Expose port 3000
EXPOSE 3000

# Set the environment variable for Next.js
ENV PORT=3000
ENV NODE_ENV=production

# Run the production server
CMD ["npm", "start"]
