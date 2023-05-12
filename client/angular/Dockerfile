FROM node:latest AS build
WORKDIR /dist/src/app
RUN npm cache clean --force
COPY package*.json .
COPY yarn* .
RUN yarn
COPY . .
RUN yarn build


FROM nginx:latest AS ngi
COPY --from=build /dist/src/app/dist/Client /usr/share/nginx/html
COPY --from=build /dist/src/app/nginx.conf  /etc/nginx/conf.d/default.conf
EXPOSE 80
