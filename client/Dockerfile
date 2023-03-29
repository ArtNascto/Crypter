FROM node:16.15.0-alpine AS build
WORKDIR /dist/src/app


RUN npm cache clean --force
COPY package.json .
COPY tsconfig.app.json .
COPY tsconfig.spec.json .
COPY tsconfig.json .
RUN npm i --legacy-peer-deps
COPY . .
RUN npm run build



FROM nginx:latest AS nginx
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=build /dist/src/app/dist/qr_client /usr/share/nginx/html
COPY --from=build /dist/src/app/config/nginx/nginx.conf  /etc/nginx/conf.d/default.conf
EXPOSE 80