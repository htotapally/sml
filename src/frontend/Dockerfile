# Stage 1: Build the React application
FROM node:20-alpine as build
WORKDIR /app
COPY env /app/.env
COPY index.html . 
COPY images/ /app/images/
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx (for production)
FROM nginx:alpine
COPY --from=build /app/images /usr/share/nginx/html/images
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
