################ Build nginx image
FROM nginx:alpine

ENV API_PORT=8000
ENV API_HOST=djangoapp

VOLUME /eat_media
VOLUME /eat_archive/static

RUN rm /etc/nginx/conf.d/default.conf

COPY ./nginx.conf /etc/nginx/conf.d/docker.template
COPY ./docker-entrypoint.sh /

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]