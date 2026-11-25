FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# The environment generator uses CI to provide safe placeholder values for
# required variables that are absent from the build context.
ENV CI=true
RUN npm run build -- --configuration=production

FROM nginx:alpine
WORKDIR /usr/share/nginx/html/
RUN rm -rf ./*

COPY --from=build /app/dist/intelehealth-ui /usr/share/nginx/html/intelehealth

EXPOSE 81
CMD ["nginx", "daemon off;"]
