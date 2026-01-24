# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage - Pure static file server
FROM nginx:alpine
RUN rm -rf /etc/nginx/conf.d/*
COPY --from=build /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
