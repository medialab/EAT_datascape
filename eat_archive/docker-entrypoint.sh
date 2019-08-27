#!/bin/sh

python /eat_archive/manage.py collectstatic --noinput 

exec $@

