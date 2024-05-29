FROM node:latest as generate
WORKDIR /app
COPY events_frontend .
# HACK: Remove test data that might have been added locally
RUN rm -r public/v1 || true
RUN npm install .
RUN npm run build

FROM nginx
COPY --from=generate /app/build /usr/share/nginx/html
