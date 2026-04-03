# Stage 1 — builder: собираем production-статику
FROM node:lts-alpine AS builder
WORKDIR /usr/src/app

# Установим production-зависимости и dev-зависимости для сборки
COPY package*.json ./
RUN npm ci --silent

# Копируем исходники и собираем
COPY . .
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN npm run build

# Stage 2 — runtime: минимальный nginx для отдачи статики
FROM nginx:stable-alpine AS runtime

# Удаляем дефолтный контент и копируем сборку
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /usr/src/app/build /usr/share/nginx/html

# (Опционально) копируем кастомную конфигурацию nginx, если есть
# COPY nginx/nginx.prod.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
