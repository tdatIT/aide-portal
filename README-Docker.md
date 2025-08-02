# Docker Setup for AIDE Portal

## Overview
Dockerfile được cấu hình với 2 môi trường build:
- **dev**: Môi trường development với hot reload
- **live/production**: Môi trường production với nginx

## Cách sử dụng

### 1. Build Docker Image

#### Build cho môi trường Development:
```bash
docker build --build-arg BUILD_ENV=dev -t aide-portal:dev .
```

#### Build cho môi trường Production:
```bash
docker build --build-arg BUILD_ENV=production -t aide-portal:prod .
```

### 2. Chạy với Docker Compose

#### Chạy môi trường Development:
```bash
docker-compose up aide-portal-dev
```
Ứng dụng sẽ chạy tại: http://localhost:5173

#### Chạy môi trường Production:
```bash
docker-compose up aide-portal-prod
```
Ứng dụng sẽ chạy tại: http://localhost:80

### 3. Chạy trực tiếp với Docker

#### Development:
```bash
docker run -p 5173:5173 -v $(pwd):/app aide-portal:dev
```

#### Production:
```bash
docker run -p 80:80 aide-portal:prod
```

### 4. Build và chạy một lần

#### Development:
```bash
docker build --build-arg BUILD_ENV=dev -t aide-portal:dev . && docker run -p 5173:5173 -v $(pwd):/app aide-portal:dev
```

#### Production:
```bash
docker build --build-arg BUILD_ENV=production -t aide-portal:prod . && docker run -p 80:80 aide-portal:prod
```

## Cấu trúc Dockerfile

- **Base stage**: Cài đặt Node.js và dependencies
- **Deps stage**: Cài đặt yarn dependencies
- **Dev stage**: Môi trường development với hot reload
- **Build stage**: Build ứng dụng cho production
- **Production stage**: Sử dụng nginx để serve static files
- **Final stage**: Chọn stage cuối cùng dựa trên BUILD_ENV

## Environment Variables

- `BUILD_ENV`: Môi trường build (dev/production)
- `NODE_ENV`: Node.js environment
- `VITE_MODE`: Vite build mode

## Ports

- **Development**: 5173 (Vite dev server)
- **Production**: 80 (Nginx)

## Volumes

Trong môi trường development, source code được mount vào container để hỗ trợ hot reload. 