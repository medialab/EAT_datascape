from django.conf.urls.defaults import *
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib import admin

admin.autodiscover()


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
                       (r'^project/(\d*)', 'project_dev'),
                       (r'^activity/(\d*)', 'project_dev'),
                       (r'^project_dev/(\d*)', 'project_dev'),

                       (r'^actor/(\d*)', 'actor_dev'),
                       (r'^actor_dev/(\d*)', 'actor_dev'),
                       (r'^credits/', 'credits_dev'),
                       (r'^credits_dev/', 'credits_dev'),

                       (r'^graph/', 'graph_dev'),
                       (r'^graph_dev/', 'graph_dev'),

                       (r'^$', 'overview_dev'),
                       (r'^overview_dev/$', 'overview_dev'),
                       (r'^admin/', include(admin.site.urls)),

                       (r'^tag/(\d*)', 'tag')


                       )

# network data
urlpatterns += patterns('eat_archive.archive.views_network',
                        (r'^actors_collaboration_network.gexf', 'actors_collaboration_network_gexf'),
                        (r'^activity_arttags_technotags_network.gexf', 'activity_arttags_technotags_network_gexf'),
                        (r'^activity_actors_network.gexf', 'activity_actors_network_gexf'),
                        (r'^htny_annotations.json', 'htny_annotations_json'),
                        (r'^actors_network.gexf', 'actors_network_gexf'),
                        (r'^activities_stream', 'activities_stream'),
                        (r'^activities_stack', 'activities_stack'),
                        (r'^actors_actorProfile.json', 'actors_actorProfile_json'),
                        )

urlpatterns += staticfiles_urlpatterns()
