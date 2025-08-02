# Multi-stage Dockerfile for Vue.js application
# Build arguments
ARG BUILD_ENV=dev

# Base stage
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./

# Dependencies stage
FROM base AS deps
RUN yarn install --frozen-lockfile

# Development stage
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["yarn", "dev", "--host", "0.0.0.0"]

# Build stage for production
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables based on build argument
ENV NODE_ENV=${BUILD_ENV}
ENV VITE_MODE=${BUILD_ENV}

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine AS production
# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA routing
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Final stage - select based on BUILD_ENV
FROM ${BUILD_ENV} AS final 