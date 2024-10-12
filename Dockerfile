# Stage 1: Build Angular App
FROM node:20.4.0-alpine3.17 as build
WORKDIR /app
COPY package*.json ./
RUN npm install -g @angular/cli && npm install && npm cache clean --force
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve Angular App using NGINX
FROM nginx:alpine
RUN mkdir -p /run
COPY --from=build /app/dist/ecommerce/browser /run
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80