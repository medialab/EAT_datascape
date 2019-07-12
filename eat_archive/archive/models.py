# -*- coding: utf-8 -*-

from django.db import models
from django.db.models import F
from tinymce import models as tinymce_models
from geopy import geocoders
from geopy.geocoders.base import GeocoderError
from random import uniform
#thumbnails management
from thumbs import ImageWithThumbsField

# MAIN ITEMS 

class Actor(models.Model):
    firstname=models.CharField(max_length=200,blank=True,null=True)
    name=models.CharField(max_length=200)
    birthdate=models.DateField(blank=True,null=True)
    deathdate=models.DateField(blank=True,null=True)
    eat_member=models.NullBooleanField(default=False)
    url=models.CharField(blank=True,null=True,max_length=500)
    # many to many
    relationships=models.ManyToManyField("Actor",through="Actor_Actor",blank=True) 
    places=models.ManyToManyField("Place",through="Actor_Place",blank=True)
    technologyTags=models.ManyToManyField("TechnologyGlossary",blank=True) 
    profileTags=models.ManyToManyField("ActorProfileGlossary",blank=True)
    #phases=models.ManyToManyField("Phase_Actor",through="Phase_Actor",blank=True)

    def __unicode__(self):
        return self.name+(", "+self.firstname if self.firstname else "" )
    def __str__(self):
        return self.name+(", "+self.firstname if self.firstname else "" )
    class Meta :
        ordering = ['name']

class Place(models.Model):
    # replace by a snippets connected to geoname web service
    name=models.CharField(max_length=100)
    address=models.TextField(blank=True)
    city=models.CharField(max_length=100)
    country=models.CharField(max_length=100)
    latitude = models.FloatField(blank=True,null=True)
    longitude = models.FloatField(blank=True,null=True)
    #lat 
    #long
    @staticmethod
    def _geolocalize_all():
        for place in Place.objects.all() :
            geolocalisation = place._geolocalisation()
            if geolocalisation:
                place.latitude=geolocalisation['lat']
                place.longitude=geolocalisation['lng']
                print unicode(geolocalisation['name']).encode("utf-8"), "(", geolocalisation['lat'], geolocalisation['lng'], ")"
                place.save()
    
    def _complete_address(self):
        if self.address != "" : return self.address + ", " + self.city + ", " + self.country
        else : return self.city + ", " + self.country
    
    def _geolocalisation(self):
        g = geocoders.Google()
        try :
            place, (lat, lng) = g.geocode(unicode(self._complete_address()).encode("utf-8"), exactly_one=False)[0]
            #place, (lat, lng) = self._complete_address(), (uniform(-45,45),uniform(-90,90))
            
            return {"name" : self.name, "address" : place, "lat" : str(lat).replace(",","."), "lng" : str(lng).replace(",",".") }
        except (GeocoderError) as e:
            #raise e
            pass
            
    def __unicode__(self):
        return self.name

class Activity(models.Model):
    name=models.CharField(max_length=300)
    description=models.TextField(blank=True)
    artTags=models.ManyToManyField("ArtGlossary",blank=True) #=> manytomany to ArtGlossary
    #mediaTags=models.ManyToManyField("MediaGlossary",blank=True) # => manytomany to MediaGlossary
    technologyTags=models.ManyToManyField("TechnologyGlossary",blank=True) # => manytomany to TechnologyGlossary
    activityTags=models.ManyToManyField("ActivityGlossary",blank=True) # => manytomany to ActivityGlossary
    children=models.ManyToManyField("Activity",through="Activity_Activity",blank=True) # => manytomany to Activity
    
    
    def __unicode__(self):
        return self.name
    class Meta :
        ordering = ['name']

class Phase(models.Model):
    actionTags=models.ManyToManyField("ActionGlossary",related_name="phases")
    actors=models.ManyToManyField("Actor",related_name="phases")
    description=models.TextField(blank=True)
    start_date=models.DateField()
    end_date=models.DateField(blank=True,null=True)
    # Many places or only one ? 
    places=models.ManyToManyField("Place",blank=True,related_name="phases") #manyToMany to Place
    activity=models.ForeignKey("Activity",related_name="phases")# activity
    
    def __unicode__(self):
        return unicode(self.activity)+"_"+str(self.start_date.year)+"_"+"_".join(unicode(_) for _ in self.actionTags.all())
        #return unicode(self.actionTags.all())
    class Meta :
        ordering = ['activity','start_date']
        
############## LINKS #################

class Actor_Actor(models.Model):
    actor1=models.ForeignKey("Actor",related_name="actor1")
    actor2=models.ForeignKey("Actor",related_name="actor2")
    relationship=models.CharField(max_length=200)    #  belongs to / work for / director of (organisation)
    start_date=models.DateField(blank=True,null=True)
    end_date=models.DateField(blank=True,null=True)
    
    class Meta:
        ordering = ["actor1","actor2"]
        verbose_name_plural = "actors' links"
        verbose_name = "actors' link"

    def __unicode__(self):
        return unicode(self.actor1)+"-"+unicode(self.actor2)+"-"+unicode(self.relationship)

class Actor_Place(models.Model) :
    actor=models.ForeignKey("Actor")
    place=models.ForeignKey("Place")
    relationship=models.CharField(max_length=200)    
    start_date=models.DateField(blank=True,null=True)
    end_date=models.DateField(blank=True,null=True)
    def __unicode__(self):
        return unicode(self.actor)+"-"+unicode(self.place)+"-"+unicode(self.relationship)

class Activity_Activity(models.Model) :
    
    activity_source=models.ForeignKey("Activity",related_name="activity_source")
    activity_target=models.ForeignKey("Activity",related_name="activity_target")
    relationship=models.CharField(max_length=200)
    
    class Meta:
        ordering = ["activity_source","activity_target"]
        verbose_name_plural = "activities' links"
        verbose_name = "activities' link"
    
    def __unicode__(self):
        return unicode(self.activity_source)+"-"+unicode(self.activity_target)+"-"+unicode(self.relationship)

# class Phase_Actor(models.Model):
#     actor=models.ForeignKey("Actor",related_name="phases")
#     phase=models.ForeignKey("Phase",related_name="actors")
#     
#     start_date=models.DateField(blank=True,null=True)
#     end_date=models.DateField(blank=True,null=True)
#     
#     def __unicode__(self):
#         return unicode(self.actor)+"-"+unicode(self.phase)
#     
#     class Meta:
#         ordering = ["actor","phase"]
#         verbose_name_plural = "phases-Actors links"
#         verbose_name = "activities' link"

        
############## TAGS : glossaries ############     

# art 
class ArtGlossary(models.Model) :
    tag=models.CharField(max_length=100)
    description=models.TextField(blank=True,null=True)

    def __unicode__(self):
        return unicode(self.tag)

# Technology
class TechnologyGlossary(models.Model) :
    tag=models.CharField(max_length=100)
    description=models.TextField(blank=True,null=True)

    def __unicode__(self):
        return unicode(self.tag)

# Activity Glossary
class ActivityGlossary(models.Model) :
    tag=models.CharField(max_length=100)
    description=models.TextField(blank=True,null=True)

    def __unicode__(self):
        return unicode(self.tag)

# ProfilActorGlossary
class ActorProfileGlossary(models.Model) :
    tag=models.CharField(max_length=100) # artist / engineer / organisation / journalist
    description=models.TextField(blank=True,null=True)
    def __unicode__(self):
        return unicode(self.tag)

# Action         
class ActionGlossary(models.Model) :
    tag=models.CharField(max_length=100) #=> voir methode de participation fiche bleue
    description=models.TextField(blank=True,null=True)
    
    def __unicode__(self):
        return unicode(self.tag)
        
# Source         
class SourceGlossary(models.Model) :
    tag=models.CharField(max_length=100) #=> voir methode de participation fiche bleue
    description=models.TextField(blank=True,null=True)
    
    def __unicode__(self):
        return unicode(self.tag)

########## SOURCES ANNOTATIONS #########################

class Source(models.Model) :
    title=models.CharField(max_length=300, blank=True,null=True)
    sourceTags=models.ManyToManyField("SourceGlossary") # manytomany to Source
    authors=models.ManyToManyField("Actor") # manytomany to actor
    ref_bibliographic=models.TextField()
    copyright=models.CharField(max_length=200,blank=True,null=True) 
    private_access=models.BooleanField(default=False)
    url=models.URLField(blank=True,null=True)
    date =models.DateField(blank=True,null=True)
    
    def __unicode__(self):
        return self.ref_bibliographic

# clipping : critical review
# research : deconnected to an exhibition moment

class Annotation(models.Model):
    title=models.CharField(max_length=300)
    source=models.ForeignKey("Source") # oneTomany to Source
    sourcemark=models.CharField(max_length=300,blank=True) # references to a part of a document (page or minutes)
    text=tinymce_models.HTMLField(blank=True) # models.TextField()
    authors=models.ManyToManyField("Actor",related_name="citations")
    actors=models.ManyToManyField("Actor",blank=True,null=True,related_name="annotations") # manyTomany to Actor
    activities=models.ManyToManyField("Activity",blank=True,related_name="annotations") # manyTomany to Activity
    places=models.ManyToManyField("Place",blank=True,related_name="annotations") # manyTomany to Place 
    phases=models.ManyToManyField("Phase"	,related_name="annotations") # manyTomany to Phase
    #image = models.ImageField(upload_to="annotation_images", blank=True,null=True)
    # before pierre (not knowing if its experimental or not…) :
    #image =ImageWithThumbsField(upload_to='annotation_images', sizes=((187,0),), blank=True,null=True )
    # pierre trying (simplest way, using directly django ImageField) :
    image = models.ImageField(upload_to='annotation_images', blank=True,null=True )
    def __unicode__(self):
        return self.title
    
