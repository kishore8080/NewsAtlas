# ---------- Stage 1: Build Frontend ----------
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copy and install dependencies
COPY frontendnext/package*.json frontendnext/yarn.lock* ./
RUN npm ci || npm install

# Copy frontend source and build
COPY frontendnext/ .
RUN npm run build


# ---------- Stage 2: Build Backend ----------
FROM python:3.10-slim AS backend-builder

WORKDIR /backend

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and data files
COPY app/ ./app
COPY json-output-files/ ./json-output-files


# ---------- Stage 3: Final Fullstack Image ----------
FROM python:3.10-slim

# Install Node.js + npm to serve static frontend build
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend
COPY --from=backend-builder /backend /app

# Copy built frontend (Next.js static build)
COPY --from=frontend-builder /frontend/.next ./frontend/.next
COPY --from=frontend-builder /frontend/public ./frontend/public
COPY --from=frontend-builder /frontend/package.json ./frontend/package.json

# Optional: install serve (if you want to serve static frontend)
RUN npm install -g serve

# Environment variables
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

# Run both backend (Uvicorn) and frontend (Serve) together
CMD uvicorn app.main:app --host 0.0.0.0 --port 8000 & serve -s ./frontend/public -l 3000
