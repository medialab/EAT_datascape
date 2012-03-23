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
from django.core import serializers
import json, time, pprint, urls, datetime, StringIO, networkx as nx
import logging

from django.db import connection, transaction
cursor = connection.cursor()
today = datetime.date.today()

# logging
logging.basicConfig(filename='/home/pom/eat_dev_logs/views.log',filemode="w+",level=logging.INFO)

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

ActorProfileGlossary.objects.filter( )
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



# -----------------------------------------



# date time handler for json dumper
dthandler = lambda obj: obj.isoformat() if isinstance(obj, datetime.date) else obj.__class__.__name__

def dictfetchall(cursor):
    "Returns all rows from a cursor as a dict"
    desc = cursor.description
    return [
        dict(zip([col[0] for col in desc], row))
        for row in cursor.fetchall()
    ]

def peopleInActivity(activity_id):
    return Actor.objects.filter(phases__in = Activity.objects.get(id=activity_id).phases.all())

def peopleAndPhasesInActivity(activity_id):
    cursor = connection.cursor()
    sql = """
        SELECT tag, start_date, end_date, actor.id  actor_id, firstname, actor.name, phase.id  phase_id
        FROM   archive_actor actor, archive_phase_actors ph_ac, archive_phase phase, archive_phase_actionTags ph_ta, archive_actionglossary ac_glo, archive_activity activity 
        WHERE  activity.id = %s AND phase.activity_id = activity.id AND ph_ac.actor_id = actor.id AND phase.id = ph_ac.phase_id 
                AND ph_ta.phase_id = phase.id AND ph_ta.actionglossary_id = ac_glo.id 
        ORDER BY actor_id,  tag, start_date 
    """ % activity_id
    cursor.execute(sql)
    
    people = {}
    for person in dictfetchall(cursor):
        p_id = person["actor_id"]
        ph_id = person["phase_id"]
        if p_id not in people : 
            people[p_id] = {}
            people[p_id]["actor_id"] = person["actor_id"] 
            people[p_id]["name"] = person["name"] 
            people[p_id]["firstname"] = person["firstname"]
            people[p_id]["data"] = {}
            people[p_id]["nb_phases"] = 0
        if ph_id not in people[p_id]["data"]:
            people[p_id]["data"]["%i" % ph_id] = dict(
                 start_date = person["start_date"]
                , end_date = person["end_date"] if person["end_date"] else None
                , label = person["tag"]
                , phase_id = ph_id
            )
            people[p_id]["nb_phases"] += 1
        else :
            people[p_id]["data"]["%i" % ph_id]["tags"] += person["tags"]
    
    return people

def get_people_over_time():
    """ computes data for the overview curve """
    people_by_month=[]
    
    phases = Phase.objects.all().order_by("start_date").annotate(num_actor=Count("actors"))
    # thanks to order by, take the first
    min_month=phases[0].start_date
    min_month.replace(min_month.year,min_month.month,1)
    # at least one phase has an None endate => today
    max_month=datetime.date.today()
    max_month.replace(max_month.year,max_month.month+1,1)
    current_month=min_month
    today=datetime.date.today()
    
    # list of months of start_dates and end_dates from phases
    list_months=[date.replace(day=1) for dates in ((p.start_date,p.end_date or today) for p in phases) for date in dates]
    list_months=list(set(list_months))
    list_months.sort()
    
    for current_month in list_months :
        # agregates by months
        if current_month.month<12 :
            next_month=current_month.replace(current_month.year,current_month.month+1,1)
        else :
            # go to next year
            next_month=current_month.replace(current_month.year+1,1,1)
        # filter phase which only intersect witht the current month
        current_phases=filter(lambda p: (current_month <= p.start_date < next_month) or (p.start_date <= current_month <= (p.end_date or today)),phases) 
        # sum nb of people
        nb_ppl = reduce(lambda x, y: x + y.num_actor, current_phases,0)
        # agregates activites
        activity_names,activity_ids= zip(*[(p.activity.name,p.activity.id) for p in current_phases])
        activity_ids=set(activity_ids)
        # process output data
        people_by_month.append((current_month, nb_ppl,len(activity_ids),"%s :: %i people :: %i activities :: %s" % (",".join(set(activity_names)), nb_ppl,len(activity_ids), current_month.strftime("%m/%Y"))))

        
    return people_by_month

def getPhasesActivity(activity_id):
    phases = Phase.objects.select_related().filter(activity=activity_id)
    for phase in phases :
        yield {"id" : phase.id, "start_date" : phase.start_date, "end_date" : phase.end_date, "tags" : [tag.tag for tag in phase.actionTags.all()]}





        
#@logged_in_or_basicauth()        
def project(request, activity_id): 
    data = { "user" : request.user}

    info_people = peopleInActivity(activity_id)
    data["info_people"] = {}
    for actor in info_people:
        data["info_people"][actor.id] = { "actor_id" : actor.id,
                                          "name" : actor.name,
                                          "firstname" : actor.firstname,
                                          "birthdate" : actor.birthdate.isoformat() if actor.birthdate else None,
                                          "deathdate" : actor.deathdate.isoformat() if actor.deathdate else None,
                                          "profileTags" : [tag.tag for tag in actor.profileTags.all()]
                                        } 
                                    

    data["people"] = json.dumps(peopleAndPhasesInActivity(activity_id), default=dthandler)
    
    data['activity'] = activity = Activity.objects.get(id=activity_id)
    
    data['places'] = ( Place.objects
                            .filter( latitude__isnull = False, phases__in = activity.phases.all() )
                            .order_by("name")
                            .distinct() )
    
    data['phases'] = json.dumps(list(getPhasesActivity(activity_id)), default = dthandler)
    
    data["info_people"] = json.dumps(data["info_people"])

    data['tags'] = {    'techno' : Activity.objects.get(id=activity_id).technologyTags.all(),
                        'art'    : Activity.objects.get(id=activity_id).artTags.all()  }
                    
    data["actor_profiles"] = ( ActorProfileGlossary.objects
                                .filter(actor__phases__in = activity.phases.all())
                                .annotate(size = Count("id")) )
   
    data['annotations'] = ( Annotation.objects
                                .filter(phases__in = Activity.objects.get(id=activity_id)
                                .phases.all())
                                .annotate(min_date=Min('phases__start_date')).order_by('min_date')
                                .distinct()
                                );
        
                      
    # dump the annotation for better javascript performances
    data['sources'] = {}
    for source in data['annotations'] :
        data['sources'][source.id] = { "id" : source.id, "title" : source.title, "text": source.text, "ref_bibliographic": source.source.ref_bibliographic, "image": { "url": source.image.url, "width":source.image.width, "height":source.image.height } if source.image else "" }
         
    data['sources'] = json.dumps( data['sources'] );   
   
    c = RequestContext(request, data)
    return render_to_response('project.html',c)



#@logged_in_or_basicauth()  
def actor(request, actor_id):
    """Returns all the data for the actor page"""
    data = {}
    phases = Actor.objects.get(id=actor_id).phases.select_related().all()
    data["actor"] = Actor.objects.get(id=actor_id)
    data["phases"] = json.dumps([ { 
                            "id" : phase.id,
                            "start_date" : phase.start_date,
                            "end_date" : phase.end_date if phase.end_date else datetime.date.today(),
                            "activity" : phase.activity.name,
                            "activity_id" : phase.activity.id,
                            "label" : [tag.tag for tag in phase.actionTags.all()],
                     } for phase in phases], default=dthandler)
    
    data["places"] = ( Place.objects
                        .filter(latitude__isnull = False, phases__in = Actor.objects.get(id=actor_id).phases.all())
                        .annotate(count=Count("id"))
                        .order_by("name") )
    data["collaborators"] = ( Actor.objects
                                .filter(phases__in = Actor.objects.get(id=actor_id).phases.all())
                                .annotate(count=Count("id")).exclude(id=actor_id)
                                .order_by("-count") )
    
    data["action_tags"] = ( ActionGlossary.objects
                                .filter(phases__in = Actor.objects.get(id=actor_id).phases.all() )
                                .annotate(count=Count("id"))
                                .order_by("-count") )
    
    data["art_tags"] =  ( ArtGlossary.objects
                            .filter(activity__phases__in = Actor.objects.get(id=actor_id).phases.all())
                            .annotate(count=Count("id"))
                            .order_by("-count")[0:3] )
   
    data["techno_tags"] = ( TechnologyGlossary.objects
                            .filter(activity__phases__in = Actor.objects
                                                                .get(id=actor_id)
                                                                .phases.all())
                            .annotate(count=Count("id"))
                            .order_by("-count")[0:3] )
                            
    c = RequestContext(request, data)
    return render_to_response('actor.html',c) 






#@logged_in_or_basicauth()  
def overview(request):
    data = {}
    data["places"] = Place.objects.filter(latitude__isnull=False).order_by("name").distinct()
    data["tag_clouds"] = [
         ("projects", Activity.objects.all().annotate(size = Count("phases__actors")).exclude(size__lt=3) ) 
       , ( "actors" , Actor.objects.all().annotate(size = Count("phases")).order_by("firstname").exclude(size__lt = 3) ) 
       , ("profiles", ActorProfileGlossary.objects.all().annotate(size = Count("actor")) ) 
       , ("art"     , ArtGlossary.objects.all().annotate(size = Count("activity")) )
       , ("techno"  , TechnologyGlossary.objects.all().annotate(size = Count("activity")) ) 
       , ( "action" , ActionGlossary.objects.all().annotate(size = Count("phases")) )   				
    ]
    data["nr_ppl_per_date"] = json.dumps(get_people_over_time(), default=dthandler)
    # data["images"] = [(anno.image ) for anno in Annotation.objects.filter(image__isnull = False) if anno.image]
    cursor = connection.cursor()
    sql = """
      SELECT a.image, a.title FROM archive_annotation a WHERE LENGTH(image) > 0

    """
    cursor.execute(sql)
    
    images = [];
    for row in dictfetchall(cursor):
        images.append( {'url':row[ 'image' ], 'title':row[ 'title' ]} );
        
	data["images"] = images
	
    
    c = RequestContext(request, data)
    return render_to_response('overview.html',c)






 



		
		
		
		
		
		
		
		

