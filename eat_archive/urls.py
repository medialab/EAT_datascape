from django.conf.urls.defaults import *



urlpatterns = patterns('',
    # Example:
    #(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    #(r'^admin/?', include(admin.site.urls)),
    (r'', include('eat_archive.archive.urls')),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:

)
