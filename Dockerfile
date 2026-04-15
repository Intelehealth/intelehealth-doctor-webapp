FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build -- --configuration=production

FROM nginx:alpine
WORKDIR /usr/share/nginx/html/
RUN rm -rf ./*

COPY --from=build /app/dist/intelehealth-ui /usr/share/nginx/html/intelehealth

EXPOSE 81
CMD ["nginx", "-g", "daemon off;"]
