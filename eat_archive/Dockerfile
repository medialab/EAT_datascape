FROM python:2.7-alpine

ENV prod=true
ENV GUNICORN_WORKERS=2

COPY . /eat_archive
WORKDIR /eat_archive

ENV LIBRARY_PATH=/lib:/usr/lib

RUN apk add --update-cache \ 
               libjpeg && \ 
    apk add --virtual=build-deps \ 
               gcc  \
               build-base python-dev py-pip jpeg-dev zlib-dev&& \
    pip --no-cache-dir install --requirement /eat_archive/requirements.txt gunicorn gunicorn[gthread] futures && \
    apk del build-deps && rm -rf /var/cache/apk/* 

VOLUME /eat_media
VOLUME /eat_archive/static
VOLUME /eat_archive/database

EXPOSE 8000

ENTRYPOINT ["sh", "/eat_archive/docker-entrypoint.sh"]

WORKDIR /

CMD ["gunicorn","--config=/eat_archive/docker-gunicorn.conf.py", "-t", "90", "--access-logfile","-", "--error-logfile","-", "eat_archive.wsgi:application"]
