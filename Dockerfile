# Stage 1: Build Angular App
FROM node:20.4.0-alpine3.17 as build
WORKDIR /app
COPY package*.json ./
RUN npm install --production && npm cache clean --force
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve Angular App using NGINX
FROM nginx:alpine
COPY --from=build /app/dist/ecommerce /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]