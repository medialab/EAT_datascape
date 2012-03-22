import os
import sys
sys.path.append('/home/pom/eat_dev')

os.environ['DJANGO_SETTINGS_MODULE'] = 'eat_archive.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
