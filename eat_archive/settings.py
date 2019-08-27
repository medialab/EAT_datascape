# -*- coding: utf-8 -*-
import os
# Django settings for eat_archive project.

ROOT_PATH = os.environ.get('ROOT_PATH', '/')

DEBUG = os.environ.get("PROD", False) == False
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
    ('Paul Girard','email'),
)

SERVER_EMAIL = "django@localhost"

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': os.path.join(ROOT_PATH, 'eat_archive/database/eat_archive.sqlite'),                      # Or path to database file if using sqlite3.
        'USER': '',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Europe/Paris'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'fr-FR'

DEFAULT_CHARSET="UTF-8"

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = True

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = os.path.join(ROOT_PATH, 'eat_media/')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = '/media/'

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
ADMIN_MEDIA_PREFIX = '/static/admin/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = os.environ.get('SECRET_KEY','11#j!nk_zei"épiéqp%83o=peb4^4kmv^_t')

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
   # 'debug_toolbar.middleware.DebugToolbarMiddleware',
    
)

ROOT_URLCONF = 'eat_archive.urls'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(ROOT_PATH, "eat_archive/templates"),
    #"/home/pat/django/debug_toolbar/templates",
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    'django.contrib.admin',	
    "eat_archive.archive",
   # 'debug_toolbar',
)

STATICFILES_DIRS = [
"/eat_archive/static"
]

STATIC_URL="/static"
STATIC_ROOT=os.path.join(ROOT_PATH, "/eat_archive/static_root")


ADMIN_REORDER = (
    ("archive", ("Actor", "Activity", "Phase","Place","Source","Annotation","Actor_Actor","Actor_Place","Activity_Activity","ArtGlossary","TechnologyGlossary","ActionGlosary","ActivityGlossary","ActorProfileGlossary","SoruceGlossary")),
   
)

INTERNAL_IPS = ('127.0.0.1','0.0.0.0') 

# from ast import literal_eval
# for k, v in os.environ.items():
#     if k.startswith("DOCKER_"):
#         key = k.split('_', 1)[1]
#         locals()[key] = literal_eval(v)



