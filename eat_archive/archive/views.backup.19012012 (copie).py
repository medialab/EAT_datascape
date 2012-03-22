# -*- coding: utf-8 -*-
# Create your views here.
from django.http import HttpResponse
from eat_archive.archive.models import *
from django.shortcuts import render_to_response
from django.template import RequestContext

from itertools import combinations
from datetime import timedelta
from datetime import date
from string import join
from itertools import groupby
from itertools import islice
from django.db.models import Avg, Max, Min, Count
from basic_auth_snippet import logged_in_or_basicauth
from django.shortcuts import redirect
from django.contrib.auth import logout
import json, time, pprint, urls, datetime, StringIO, networkx as nx

from django.db import connection, transaction
cursor = connection.cursor()
today = datetime.date.today()


# page collaborator
def collaborator( request, id ):
	response = HttpResponse()
	c= RequestContext(request)
	return render_to_response("collaborator.dtl",c)
	return response

# controller layer
	
def _activity_tags_cloud_dict(tags) :
	''' fabrics a dictionnary for tagclouds about activities used by activityType_cloud_json & art_cloud_json'''
	cloud=[]
	for tag in tags :
		# set the arttag is as the number of activities using that tag
		size=tag.activity_set.count()
		if size >0 :
			cloud.append({"tag":unicode(tag),"size":size,"url":""})
	return cloud
	
def _activityType_cloud():
# json to make an activity type tagcloud
	activity_tags=ActivityGlossary.objects.all()
	return _activity_tags_cloud_dict(activity_tags)


def _art_cloud():
# json to make an art artcloud
	art_tags=ArtGlossary.objects.all()
	return _activity_tags_cloud_dict(art_tags)

def _technology_cloud():
    techno_tags=TechnologyGlossary.objects.all()
    return _activity_tags_cloud_dict(techno_tags)

def _action_cloud(id=-1):
	cloud=[]
	if id==-1 : 
	    tags = ActionGlossary.objects.annotate(num_phases=Count('phases'))    
	    for tag in tags :
		    # set the arttag is as the number of activities using that tag
		    size=tag.num_phases
		    if size >0 :
			    cloud.append({"tag":unicode(tag),"size":size,"url":""})
	    return cloud
	
def _actorProfile_cloud(id=-1): #id represente l'id d'une phase
	cloud=[]
	if id==-1 : 
	    tags = ActorProfileGlossary.objects.all()    
	    for tag in tags :
		    # set the arttag is as the number of activities using that tag
		    size=tag.actor_set.count()
		    if size >0 :
			    cloud.append({"tag":unicode(tag),"size":size,"url":""})
	    return cloud
	else :
	    profileTags = {}
	    for phase in Activity.objects.get(id=id).phases.all():
	        for actor in phase.actors.all():
	            for profile in actor.profileTags.all():     
	                if profile not in profileTags: profileTags[profile] = 0
	                profileTags[profile] = profileTags[profile] + 1
	    for tag, size in profileTags.iteritems() :
		    if size >0 :
			    cloud.append({"tag":unicode(tag),"size":size,"url":""})
	    return cloud

def _actor_cloud(id):
	tags=Actor.objects.annotate(num_phases=Count('phases'))
	cloud=[]
	tags = list(tags)
	for tag in tags :
		# set the arttag is as the number of activities using that tag
		size=tag.num_phases
		if size >0 :
			cloud.append({"tag":unicode(tag),"size":size,"url":""})
	return cloud

# views mapped in urls.py
#========================
# json views
# ---------------
def activityType_cloud_json(request):
	cloud_json = json.dumps(_activityType_cloud(),ensure_ascii=False)
	response = HttpResponse(cloud_json,mimetype="text/json")
	response['Content-Disposition'] = 'attachment; filename=activityType_cloud.json'
	return response
	
def art_cloud_json(request):
	cloud_json = json.dumps(_art_cloud(),ensure_ascii=False)
	response = HttpResponse(cloud_json,mimetype="text/json")
	response['Content-Disposition'] = 'attachment; filename=art_cloud.json'
	return response
	
def technology_cloud_json(request):
	cloud_json = json.dumps(_technology_cloud(),ensure_ascii=False)
	response = HttpResponse(cloud_json,mimetype="text/json")
	response['Content-Disposition'] = 'attachment; filename=technology_cloud.json'
	return response

def action_cloud_json(request):
	cloud_json = json.dumps(_action_cloud(),ensure_ascii=False)
	response = HttpResponse(cloud_json,mimetype="text/json")
	response['Content-Disposition'] = 'attachment; filename=action_cloud.json'
	return response

def actorProfile_cloud_json(request):
	cloud_json = json.dumps(_actorProfile_cloud(),ensure_ascii=False)
	response = HttpResponse(cloud_json,mimetype="text/json")
	response['Content-Disposition'] = 'attachment; filename=actorProfile_cloud.json'
	return response

def actor_cloud_json(request):
	cloud_json = json.dumps(_actor_cloud(),ensure_ascii=False)
	response = HttpResponse(cloud_json,mimetype="text/json")
	response['Content-Disposition'] = 'attachment; filename=actor_cloud.json'
	return response
	
# --------------------
def activity_arttags_technotags_network(request) :
	G = nx.Graph()
	for activity in Activity.objects.all() :
		G.add_node(unicode(activity),type='activity')
		for art_tag in activity.artTags.all() :
			G.add_node(unicode(art_tag),type='art tag')
			G.add_edge(unicode(activity),unicode(art_tag))
		for techno_tag in activity.technologyTags.all() :
			G.add_node(unicode(techno_tag),type='techno tag')
			G.add_edge(unicode(activity),unicode(techno_tag))
		for activity_linked in activity.children.all() :
			G.add_node(unicode(activity_linked),type='activity')
			G.add_edge(unicode(activity),unicode(activity_linked))
	# using a memory file to store gexf in a buffer. We don't want to write this on the disk
	output_gexf = StringIO.StringIO()	
	nx.write_gexf(G,output_gexf)	
	response = HttpResponse(output_gexf.getvalue(),mimetype="text/gexf")
	response['Content-Disposition'] = 'attachment; filename=activity_arttags_technotags.gexf'
	return response

def htny_phases(requet) :
	
	htny=Activity.objects.filter(name="Homage to New York")[0]
	data={"activity":htny.name}
	data["phases"]=[]
	for phase in htny.phases.all() :
		phase_dict={}
		
		phase_dict["title"]=unicode(phase)
		phase_dict["actionTags"]=",".join([unicode(action) for action in phase.actionTags.all()])
		phase_dict["start_date"]=unicode(phase.start_date)
		phase_dict["end_date"]=unicode(phase.end_date)
		phase_dict["actors"]=",".join([unicode(actor) for actor in phase.actors.all()])
		phase_dict["places"]=[{"address":place.address,"city":place.city,"country":place.country} for place in phase.places.all()]
		data["phases"].append(phase_dict)
	phases_json = json.dumps(data,ensure_ascii=False)
	response = HttpResponse(phases_json,mimetype="text/json")
	response['Content-Disposition'] = 'attachment; filename=phases_json.json'
	return response

def json_list(request):
    html = '''
    <html>
    <body>
        <ul>
            <li><a href="art_cloud.json">Art Cloud Json</a></li>
            <li><a href="techno_cloud.json">Techno Cloud Json</a></li>
            <li><a href="actor_profile_cloud.json">Actor Profile Json</a></li>
            <li><a href="activity_type_cloud.json">Activity Type Json</a></li>
            <li><a href="action_cloud.json">Action Cloud</a></li>
            <li><a href="actor_cloud.json">Actor Cloud</a></li>
        </ul>
    </body>
    </html>
    '''
    return HttpResponse(html)

def _phase_data(id, start_zoom, end_zoom, what=Activity): 
    ''' return all data concerning phases of a particular activity 
        this function works in 3 times
        1. get the data, minimum date, maximum_date etc..
        2. manage overlap : setting level for each phase
        3. manage zoom parameters in the URL
        4. manage phases which have no end_date : setting their end_date to max_date
        5. calculate left and width values for display    
    ''' 
    data = list()
    
    phases = what.objects.get(id=id).phases.all()
    min_date, max_date = phases[0].start_date, phases[0].end_date
    
    for phase in phases:
        #tag
        tags = [str(tag) for tag in phase.actionTags.all()]
        #dates
        start_date = phase.start_date
        end_date = phase.end_date
        # phase whose duration is less than 1 week are put to 1 week
        if end_date and (end_date-start_date).days<7 :
            start_date = start_date - timedelta(days=4)                  
            end_date = end_date + timedelta(days=4)
        if end_date and start_date < min_date : min_date = start_date
        if end_date and end_date   > max_date : max_date = end_date
        #if not end_date : max_date = date.today()
        data.append({   "id"        : phase.id, 
                        "tags"      : tags, 
                        "start_date": start_date,
                        "end_date"  : end_date,
                        "display_start_date" : start_date,
                        "display_end_date" :   end_date,
                        "places" : phase.places.filter(latitude__isnull = False),
                        "activity" : phase.activity,
                    })
    
    
    # manage overlap
    # we iterate chronogically through the phases, and we keep a list of 
    # opened_phases (which end_date is greater than the start_date of the phase
    # we're iterating on). if there are opened phases, we must set
    # the level of the phase we're iterating on to the maximum level of the 
    # opened phases + 1
    data = sorted(data, key=lambda phase:phase['start_date']) # tri chronologique      
    
    opened_phases = list() # at the beginning, there is no opened phase

    # filterConstructor returns a function which will act as a filter
    # to update opened_phases, we need to construct this function
    # each time we change of reference_phase
    # as a closure because filter() need an unary function
    def filterConstructor(reference_phase):
        if isinstance(reference_phase['start_date'],date)==True :
            def CustomFilter(specimen_phase) :
                if isinstance(specimen_phase['end_date'],date)==True or specimen_phase['end_date']==None:
                    # if reference_phase[start] <= check[end] keep it 
                    # if reference_phase[start] > check[end] delete it 
                    if specimen_phase['end_date']==None:
                        return True
                    return reference_phase['start_date'] <= specimen_phase['end_date']
        else :
            def CustomFilter(specimen_phase) :
                return True
        return CustomFilter

    for i,_ in enumerate(data): 
        data[i]['level'] = 0
        data[i]['truncated_start'] = False
        data[i]['truncated_end'] = False
        
        date_filter = filterConstructor(data[i])

        opened_phases = filter(date_filter,opened_phases) 
        # setting level to max level + 1            
        if len(opened_phases) != 0 :            # if there is at least 1 opened phase
            max_level = max(opened_phases, 
                              key=lambda phase: phase['level'])['level'] # we take the maximum level
            data[i]['level'] = max_level + 3   # 3 is the number of pixel offset
        else :                                  # no opened phase
            data[i]['level'] = 0                # reset level
        opened_phases.append(data[i])
        
    #--------- 
    

    # manage the zoom parameters in the URL
    real_min_date, real_max_date = min_date,max_date 
    if (start_zoom and end_zoom) :
        if (start_zoom > min_date or end_zoom < max_date): # if zooming values mean something
            for index,_ in enumerate(data): 
                if isinstance(data[index]['end_date'],date) == False: # for phases that have no end_date
                    data[index]['end_date']=end_zoom                  # we set end_date to the end_zoom
                    data[index]['truncated_end'] = True                 
                    max_date = end_zoom
                if start_zoom and data[index]['start_date'] < start_zoom : # start_date < start_zoom_bas -> truncate left
                    data[index]['display_start_date'] = start_zoom
                    data[index]['truncated_start'] = True
                    min_date=start_zoom 
                if data[index]['end_date'] > end_zoom: # end_date < end_zoom_bas -> truncate right
                    data[index]['display_end_date'] = end_zoom
                    data[index]['truncated_end'] = True
                    max_date = end_zoom
                
            total_duration = (max_date - min_date).days
        
    total_duration = (max_date - min_date).days
    
    # manage phases which have no end_date (Preserving) 
    # we set the end_date to max_date and notify that the phase is truncated
    for index,_ in enumerate(data):
        if isinstance(data[index]['end_date'],date) == False:
            data[index]['display_end_date'] = max_date
            data[index]['end_date'] = max_date
            data[index]['truncated_end'] = True  
    
    # ------------------
    
    # we calculate left offset and width (for display) 
    
    data_percentage = [
                        dict(    
                            # two new properties
                             left = int(float((datum['display_start_date']-min_date).days)/float(total_duration)*100),
                             width = int(float(((datum['display_end_date'] or max_date)- datum['display_start_date']).days)/float(total_duration)*100) if datum['display_start_date']<max_date else -1,
                             **datum #and the rest
                         ) 
                        for datum in data
                      ]
    data = data_percentage                        
    return data,real_min_date,real_max_date
 
def _profile_data(id,min_date=None,max_date=None):
    '''
    returns profile_data for a particular activity
    you can specifiy a min_date and max_date 
    useful for period parameters
    '''
    data = dict()
    kwargs = {}
    if min_date:
        kwargs['start_date__lt'] = max_date  #start_date < max_date
    if max_date: 
        kwargs['end_date__gt'] = min_date    #end_date > min_date
    phases = Activity.objects.get(id=id).phases.all().filter(**kwargs) 
    profile_list = []
    for phase in phases:               
        for actor in phase.actors.all():
            [profile_list.append(unicode(profileTag)) for profileTag in actor.profileTags.all()]
    profile_list = sorted(set(profile_list))
    return profile_list
                  
def _actors_data(id,min_date=None,max_date=None, what=Activity) :
    ''' return data about actors who played a part in a particular activity 
        actors are sorted by the number of phases they participated in
    '''
    data = dict()
    kwargs = {}
    if min_date:
        kwargs['start_date__lt'] = max_date  #start_date < max_date
    if max_date: 
        kwargs['end_date__gt'] = min_date    #end_date > min_date
    phases = what.objects.get(id=id).phases.all().filter(**kwargs)
    
    for phase in phases:               
        for actor in phase.actors.all():
            if actor.id not in data :
                data[actor.id] = dict()
                data[actor.id]['name'] = unicode(actor)
                data[actor.id]['profile'] = join( sorted([unicode(tag) for tag in actor.profileTags.all()]),'_'  )
                data[actor.id]['phases'] = dict()
            data[actor.id]['phases'][phase.id] = dict()
            data[actor.id]['phases'][phase.id]["actionTags"] = phase.actionTags.all() 
            data[actor.id]['phases'][phase.id]["start_date"] = phase.start_date 
            data[actor.id]['phases'][phase.id]["end_date"] = phase.end_date

    data2 = [{  'id'        : id, 
                'name'      : actor["name"], 
                'phases'    : actor["phases"], 
                'profile'   : actor["profile"],
                'phase_count'   : len(actor["phases"]),
             } 
             for id, actor in data.iteritems()
            ]
    data3 = sorted(data2, key=lambda actor: -actor['phase_count'])
    return data3   

def _annotation_data(id, what=Activity):
    data = {}
    for p in what.objects.get(id=id).phases.all():
        if p.id not in data:
                data[p.id] = {}
                data[p.id]['actionTags'] = [unicode(actionTag) for actionTag in p.actionTags.all()] 
                data[p.id]['annotations'] = {}
        for a in p.annotations.all():
            authors = []
            for author in a.authors.all():
                authors.append(unicode(author)) 
            data[p.id]['annotations'][a.id] = {'id'                : a.id,
                                                'authors'          : authors,
                                                'source_title'     : a.source.title,
                                                'annotation_title' : a.title,
                                                'text'             : a.text,
                                                'sourcemark'       : a.sourcemark,
                                                'ref_bibliographic': a.source.ref_bibliographic,
                                                'image_url'        : a.image.url if a.image else None,
                                              }
    return data, json.dumps(data)

@logged_in_or_basicauth()        
def project(request,id=0, start_zoom=None, end_zoom=None):
    t0 = time.time()
    data = dict()
    data['id'] = id
    data['start_zoom'] = date(day=int(start_zoom[0:2]),
                              month=int(start_zoom[2:4]), 
                              year=int(start_zoom[4:8])) if start_zoom else None
    data['end_zoom']   = date(day=int(end_zoom[0:2]), 
                              month=int(end_zoom[2:4]),
                              year=int(end_zoom[4:8])) if end_zoom else None
    data['name'] = Activity.objects.get(id=id).name
    #print "t1 %.2f" % (time.time() - t0)
    data['phases'], data['min_date'], data['max_date'] = _phase_data(id,data['start_zoom'],data['end_zoom'])
    #print "t2 %.2f" % (time.time() - t0)
    data['actors'] = _actors_data(id, data['start_zoom'], data['end_zoom'])
    #print "t3 %.2f" % (time.time() - t0)
    data['tags']                  = dict()
    data['tags']['techno']        = [str(t) for t in list(Activity.objects.get(id=id).technologyTags.all())]
    #data['tags']['action']        = _action_cloud(id)
    data['tags']['action']        = _action_cloud(id)
    data['tag_cloud'] =  {}
    data['tag_cloud']['actor_profile'] = _actorProfile_cloud(id)
    #data['tags']['activity_type'] = _activityType_cloud(id)
    #print "t4 %.2f" % (time.time() - t0)
    data['tags']['art']           = [str(t) for t in list(Activity.objects.get(id=id).artTags.all())]
    #data['tags']['actor']         = _actor_cloud(id)
    
    data['annotations'] = {}
    data['annotations']['object'], data['annotations']['json'] = _annotation_data(id)
    data['profile_list'] = _profile_data(id, data['start_zoom'], data['end_zoom'])
    #print "t5 %.2f" % (time.time() - t0)
    c= RequestContext(request, data)
    
    return render_to_response("project.dtl",c)

@logged_in_or_basicauth()    
def actor(request, id=0, start_zoom=None, end_zoom=None):
    data = dict()
    data['start_zoom'] = date(day=int(start_zoom[0:2]),
                              month=int(start_zoom[2:4]), 
                              year=int(start_zoom[4:8])) if start_zoom else None
    data['end_zoom']   = date(day=int(end_zoom[0:2]), 
                              month=int(end_zoom[2:4]),
                              year=int(end_zoom[4:8])) if end_zoom else None
    data['actor'] = actor = Actor.objects.get(id=id)
    data['tags'] = []
    data['tags']['techno'] = actor.technologyTags.all()
    data['tags']['profile'] = actor_projects = actor.technologyTags.all()
    data['phases'], data['min_date'], data['max_date'] = _phase_data(id,data['start_zoom'],data['end_zoom'], what=Actor)
    data['annotations'] = {}
    data['annotations']['object'], data['annotations']['json'] = _annotation_data(id, Actor)
    data['actors'] = _actors_data(id, None, None, Actor)
    c= RequestContext(request, data)
    return render_to_response("actor.dtl",c)

#def overview(request):
#    data = dict()
#    data['id'] = id
#    data['tag_cloud']                  = dict()
#    data['tag_cloud']['techno']        = _technology_cloud(id)
#    data['tag_cloud']['action']        = _action_cloud(id)
#    data['tag_cloud']['actor_profile'] = _actorProfile_cloud(id)
#    data['tag_cloud']['activity_type'] = _activityType_cloud(id)
#    data['tag_cloud']['art']           = _art_cloud(id)
#    data['tags']['actor']         = _actor_cloud(id)
#    c= RequestContext(request, data)
#    return render_to_response("index.html",c)

@logged_in_or_basicauth()        		
def overview(request):
    t0 = time.time()
    data = {}
    data['tag_cloud'] = {}
    #print "t1 %.2f" % (time.time() - t0)
    data['tag_cloud']['action'] = _action_cloud()
    #print "t2 %.2f" % (time.time() - t0)
    data['tag_cloud']['actor_profile'] = _actorProfile_cloud(-1)
    #print "t3 %.2f" % (time.time() - t0)
    data['tag_cloud']['techno']  = _technology_cloud()
    #print "t4 %.2f" % (time.time() - t0)
    data['tag_cloud']['activity_type'] = _activityType_cloud()
    #print "t5 %.2f" % (time.time() - t0)
    data['tag_cloud']['art']           = _art_cloud()
    #print "t6 %.2f" % (time.time() - t0)
    data['tag_cloud']['actor']           = _actor_cloud(-1)
    #print "t7 %.2f" % (time.time() - t0)
    data['places'] = []
    data['min_date'] = Phase.objects.all().order_by("start_date")[0].start_date
    data['max_date'] = Phase.objects.all().order_by("end_date")[0].end_date
    data['places'] = []
    for p in Place.objects.all():           
         if p.latitude :
            data['places'].append({
                    "id"  : p.id,
                    "address" : p.address,
                    "lat" : p.latitude,
                    "lng" :p.longitude,
                    "name" : p.name
                })
                
    c= RequestContext(request, data)
    return render_to_response("overview.dtl",c)

#@logged_in_or_basicauth()        
def index(request):
    data = {}
    data['activities'] = {}
    data['activities'] = Activity.objects.all().order_by('name')

    c= RequestContext(request, data)
    return render_to_response('index.dtl',c)

def stack(request):
    data = {}
    c = RequestContext(request, data)
    return render_to_response('stack.dtl',c)

def logout_view(request):
    logout(request)
    return redirect('/eat_datascape/auth')


# def actors_network(request) :
# 	G = nx.Graph()
# 	
# 	for actor in Actor.objects.all() :
# 		G.add_node(unicode())
# 		
# 	for activity in Activity.objects.all() :
# 		G.add_node(unicode(activity),type='activity')
# 		for art_tag in activity.artTags.all() :
# 			G.add_node(unicode(art_tag),type='art tag')
# 			G.add_edge(unicode(activity),unicode(art_tag))
# 		for techno_tag in activity.technologyTags.all() :
# 			G.add_node(unicode(techno_tag),type='techno tag')
# 			G.add_edge(unicode(activity),unicode(techno_tag))
# 		for activity_linked in activity.children.all() :
# 			G.add_node(unicode(activity_linked),type='activity')
# 			G.add_edge(unicode(activity),unicode(activity_linked))
# 	# using a memory file to store gexf in a buffer. We don't want to write this on the disk
# 	output_gexf = StringIO.StringIO()	
# 	nx.write_gexf(G,output_gexf)	
# 	response = HttpResponse(output_gexf.getvalue(),mimetype="text/gexf")
# 	response['Content-Disposition'] = 'attachment; filename=activity_arttags_technotags.gexf'
# 	return response
		
		
		
		
		
		
		
		
		
		
		
