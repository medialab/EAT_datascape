FROM python:2.7-alpine

ENV prod=true
ENV GUNICORN_WORKERS=2

COPY . /
WORKDIR /

ENV LIBRARY_PATH=/lib:/usr/lib

RUN apk add --update-cache \ 
               libjpeg && \ 
    apk add --virtual=build-deps \ 
               gcc  \
               build-base python-dev py-pip jpeg-dev zlib-dev&& \
    pip --no-cache-dir install --requirement /eat_archive/requirements.txt gunicorn&& \
    apk del build-deps && rm -rf /var/cache/apk/* 

VOLUME /eat_media
VOLUME /eat_archive/static
VOLUME /eat_archive/database

EXPOSE 8000
CMD ["gunicorn","--config=docker-gunicorn.conf.py", "-t", "90", "--chdir", "eat_archive","--access-logfile","-", "--error-logfile","-", "eat_archive.wsgi:application"]