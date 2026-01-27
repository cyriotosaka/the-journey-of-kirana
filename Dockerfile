# ===========================================
# 🐳 DOCKERFILE - The Journey of Kirana
# ===========================================
# Multi-stage build for production-ready image
# Final image: nginx serving static files (~30MB)

# ========== STAGE 1: Build ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build arguments for env vars
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Build production bundle
RUN npm run build

# ========== STAGE 2: Production ==========
FROM nginx:alpine AS production

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy service worker to root
COPY --from=builder /app/public/sw.js /usr/share/nginx/html/sw.js

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
