FROM node:latest as generate
WORKDIR /app
COPY events_frontend .
RUN npm install .
RUN npm run build

FROM nginx
COPY --from=generate /app/build /usr/share/nginx/html
