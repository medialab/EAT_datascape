from django.http import HttpResponse
from eat_archive.archive.models import *
from django.shortcuts import render_to_response
from django.template import RequestContext
import networkx as nx
import StringIO
import json
from itertools import combinations
import re
import datetime
from django.db.models import Avg, Max, Min, Count
from copy import deepcopy

def actors_network_gexf(request) :
    G = nx.Graph()
    
    for actor in Actor.objects.all() :
        profile=",".join(unicode(actorProfiletag) for actorProfiletag in actor.profileTags.all())
        G.add_node(actor.id,name=unicode(actor),type='actor',profile=profile)
        n=G[actor.id]
        
        for relationship in actor.actor1.all() :
            G.add_edge(relationship.actor1.id,relationship.actor2.id,relationship=unicode(relationship.relationship))
        for relationship in actor.actor2.all() :
            G.add_edge(relationship.actor1.id,relationship.actor2.id,relationship=unicode(relationship.relationship))
        
        for phase in actor.phases.all():
            profile=",".join([unicode(tag) for tag in phase.activity.activityTags.all()])
            G.add_node(phase.activity.id,name=unicode(phase.activity),type='activity',profile=profile)
            G.add_edge(actor.id,phase.activity.id,relationship=unicode("collaboration"))
        
    output_gexf = StringIO.StringIO()    
    nx.write_gexf(G,output_gexf)    
    response = HttpResponse(output_gexf.getvalue(),mimetype="text/gexf")
    response['Content-Disposition'] = 'attachment; filename=actors_network.gexf'
    return response

def activity_arttags_technotags_network_gexf(request) :
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


def htny_annotations_json(request) :
    
    htny=Activity.objects.filter(name="Homage to New York")[0]
    data={"activity":htny.name}
    data["annotations"]=[]
    for phase in htny.phases.all() :
        data[unicode(phase)]=[]
        for annotation in phase.annotations.all() :
            annotation_dict={}
            annotation_dict["source"]=unicode(annotation.source)
            annotation_dict["sourcemark"]=annotation.sourcemark
            annotation_dict["text"]=annotation.text
            annotation_dict["authors"]=[unicode(author) for author in annotation.authors.all()]
            data[unicode(phase)].append(annotation_dict)
    phases_json = json.dumps(data,ensure_ascii=False)
    response = HttpResponse(phases_json,mimetype="text/json")
    response['Content-Disposition'] = 'attachment; filename=HTNY_annotations.json'
    return response
    
    
def activities_stream_old(request) :
    # we want : dates as x axis with same date definition for all 
    # number of collaborators as y axis
    activities=Activity.objects.all()
    datasets={"title":"activities stream","x-axis":"time","y-axis":"number of collaborators"}
    datasets["curves"]=[]
    curves=[]
    for activity in activities :
        curve={"title":unicode(activity),"url":"project/"+str(activity.id)}#"title":unicode(activity).replace(u"'","").encode("utf-8")
        dates={}
        for phase in activity.phases.all():
            if phase.start_date :
                dates[phase.start_date]=dates[phase.start_date]+list(phase.actors.all()) if phase.start_date in dates.keys() else list(phase.actors.all())
            if phase.end_date :
                dates[phase.end_date]=dates[phase.end_date]+list(phase.actors.all()) if phase.end_date in dates.keys() else list(phase.actors.all())
        curve["points"]=[{"x":unicode(date),"y":len(set(actors))} for date,actors in dates.iteritems()]#[unicode(actor) for actor in set(actors)]
        datasets["curves"].append(curve)
    data={}
    data['jsondata'] = json.dumps(datasets,ensure_ascii=False)
    c= RequestContext(request, data)
    return render_to_response("streamgraph.html",c)
    
def _activities_timeline() :
    # we want : dates as x axis with same date definition for all 
    # number of collaborators as y axis
    
    # max date = now
    max_date=datetime.date.today()
    max_month=datetime.date(max_date.year,max_date.month+1,1)
    # min date = min phase create_date
    min_date=Phase.objects.aggregate(Min("start_date"))["start_date__min"]
    min_month=datetime.date(min_date.year,min_date.month,1)
    
         
    # iterate on month from min to max
    defaults_points={}
    current_month=min_month
    while current_month<max_month :
        defaults_points[current_month.strftime("%Y%m")]={}
        defaults_points[current_month.strftime("%Y%m")]["nb_actors"]=0
        defaults_points[current_month.strftime("%Y%m")]["activities"]=[]
        next_month=current_month+datetime.timedelta(31)
        next_month=datetime.date(next_month.year,next_month.month,1)
        current_month=next_month
    
    # preparing activities dict {activity_id:0,...}
    activities_points={}
    for a in Activity.objects.all() :
        activities_points[str(a.id)] = deepcopy(defaults_points)
    
    for phase in Phase.objects.all() :
        first_month=phase.start_date
        first_month=datetime.date(first_month.year,first_month.month,1)
        current_month=first_month
        
        max_month = min(phase.end_date, datetime.date.today()) if phase.end_date else datetime.date.today()
        while current_month< max_month :
            activities_points[str(phase.activity.id)][current_month.strftime("%Y%m")]["nb_actors"]+=phase.actors.count()
            activities_points[str(phase.activity.id)][current_month.strftime("%Y%m")]["activities"]+=[unicode(phase.activity)]
            next_month=current_month+datetime.timedelta(31)
            next_month=datetime.date(next_month.year,next_month.month,1)
            current_month=next_month
    
    return activities_points


    
#    # stream data initialisation
#    streams={}
#    for activity_id in activities_ids.keys() :
#        streams[activity_id]=[]
#        
#    # iterate on month from min to max
#    current_month=min_month
#    while current_month<max_month :
#        # reinitialisation of activity_id_nb_actors_dict
#        activity_id_nb_actors_dict=activities_ids
#        # add first phases which have one date in the month
#        activity_id_nb_actors_dict.update(dict([(phase.activity.id,list(phase.actors.all())) for phase in Phase.objects.filter(start_date__range=(current_month,current_month-datetime.timedelta(1)))]))
#        # add phases which last over the month
#        next_month=current_month+datetime.timedelta(31)
#        next_month=datetime.date(next_month.year,next_month.month,1)
#        for phase in Phase.objects.filter(start_date__lt=(current_month),end_date__gte=(next_month)) :
#            activity_id_nb_actors_dict[phase.activity.id]+=list(phase.actors.all())
#        
#        # put data in stream
#        for activity_id,actors in activity_id_nb_actors_dict.iteritems() :
#            # stream as one list per activity with points as dicts x:month y:nb_unique_actors
#            streams[activity_id].append({"x":unicode(current_month),"y":len(set(actors))})
#        #iterate to next month
#        current_month=next_month
    # return stream !
    
def activities_stack(request) :
    
    activities_points=_activities_timeline()
    
    #datasets={"title":"activities stream","x-axis":"time","y-axis":"number of collaborators"}
    datasets=[]
    activities=[]
    curves=[]
    for activity_id,points in activities_points.iteritems() :
        activities.append({"title":unicode(Activity.objects.get(id=activity_id)),"url":"project/"+str(activity_id)})
        curve=[{"x":(int(month)/100-1960)*12+int(month)%100,"y":d["nb_actors"],"activities":d["activities"]} for month,d in points.iteritems()]
        curves.append(curve)
    curves2 = {}
    for curve in curves:
      for month in curve :
        x = month['x']
        y = month['y']       
        if x not in curves2:
          curves2[x] = {}
          curves2[x]["y"] = 0
          curves2[x]["activities"] = ",".join(month['activities'])
        curves2[x]["y"] = curves2[x]["y"] + y
    
    curves3 = [{"x":x,"y":d['y'],"title":d['activities']} for x,d in curves2.iteritems()]
    curves4 = ["01/" + str(x%12+1) + "/"+str(x/12+1960) for x,_ in curves2.iteritems()]
        
    datasets={"activities":activities,"curves":curves}
    data = {}
    data['jsondata'] = json.dumps(datasets,ensure_ascii=False)
    curves2_json = json.dumps([curves3,curves4],ensure_ascii=False)
    response = HttpResponse(curves2_json,mimetype="text/json")
    response['Content-Disposition'] = 'attachment; filename=activities_stack.json'
    return response
   # c= RequestContext(request, data)
   # return render_to_response("stack.dtl",c)
    
    
def activities_stream(request) :
    
    activities_points=_activities_timeline()
    
    datasets={"title":"activities stream","x-axis":"time","y-axis":"number of collaborators"}
    datasets["curves"]=[]
    curves=[]
    for activity_id,points in activities_points.iteritems() :
        curve={"title":unicode(Activity.objects.get(id=activity_id)),"url":"project/"+str(activity_id)}#"title":unicode(activity).replace(u"'","").encode("utf-8")
        curve["points"]=points
        datasets["curves"].append(curve)
    data={}
    data['jsondata'] = json.dumps(datasets,ensure_ascii=False)
    c= RequestContext(request, data)
    return render_to_response("streamgraph.html",c)

        
def actors_actorProfile_json(request) :
    
    actors=Actor.objects.all()
    data={"actors":[]}
    
    for actor in actors :
    	tags=",".join([unicode(tag) for tag in actor.profileTags.all()])
    	data["actors"].append({"id":actor.id,"name":unicode(actor),"tags":tags,"nb_phases":actor.phases.count()})
        
    
    
    actors_profile_json=json.dumps(data,ensure_ascii=False)
    response = HttpResponse(actors_profile_json,mimetype="text/json")
    response['Content-Disposition'] = 'attachment; filename=actors_profile.json'
    return response
    

