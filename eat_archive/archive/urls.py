from django.conf.urls.defaults import *
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib import admin




urlpatterns = patterns('eat_archive.archive.views',
        # Other patterns go here
      #  (r'^selectable/', include('selectable.urls')),
              (r'^art_cloud.json', 'art_cloud_json'),
        (r'^techno_cloud.json', 'technology_cloud_json'),
        (r'^actor_profile_cloud.json', 'actorProfile_cloud_json'),
        (r'^activity_type_cloud.json', 'activityType_cloud_json'),
        (r'^action_cloud.json', 'action_cloud_json'),
        (r'^actor_cloud.json', 'actor_cloud_json'),
        (r'^action_cloud.json', 'action_cloud_json'),
        (r'^project/(\d*)/period/(\d*)-(\d*)', 'project'),
        (r'^project/(\d*)', 'project'),
        (r'^actor/(\d*)', 'actor'),
        (r'^$', 'overview'),
        (r'^admin/', include(admin.site.urls))
    )

# network data 
urlpatterns += patterns('eat_archive.archive.views_network',
        (r'^activity_arttags_technotags_network.gexf', 'activity_arttags_technotags_network_gexf'),
        (r'^htny_annotations.json', 'htny_annotations_json'),
        (r'^actors_network.gexf', 'actors_network_gexf'),
        (r'^activities_stream', 'activities_stream'),
        (r'^activities_stack','activities_stack'),
        (r'^actors_actorProfile.json', 'actors_actorProfile_json'), 
    )
    
urlpatterns += staticfiles_urlpatterns()

