from django.contrib import admin
from eat_archive.archive.models import *
from eat_archive.archive.forms import *

# links
# class Actor_ActorInline(admin.TabularInline):
#     model = Actor_Actor
#     extra = 1

admin.site.register(Actor_Actor)

class Actor_PlaceInline(admin.TabularInline):
    model = Actor_Place
    extra = 1

class Actor_Actor1Inline(admin.StackedInline):
    model = Actor_Actor
    fieldsets=(("",{"fields":(('actor2','relationship'),('start_date','end_date'))}),)
    fk_name = 'actor1'
    extra = 1

class Actor_Actor2Inline(admin.StackedInline):
    model = Actor_Actor
    fieldsets=(("",{"fields":(('actor1','relationship'),('start_date','end_date'))}),)
    fk_name = 'actor2'
    extra = 1

class AnnotationInline(admin.StackedInline):
	model = Annotation
	list_display=("title","source","sourcemark")
	#list_filter = ('sourceTags',)
	fieldsets = (("References", {'fields': ('title','sourcemark','authors','text','phases',)}),)
	filter_horizontal = ("authors","phases")
	exclude=('actors','activities','places')
	extra = 1


admin.site.register(Activity_Activity)
admin.site.register(ActionGlossary)


# Glosarries
class ArtGlossaryInline(admin.TabularInline):
    model = ArtGlossary
    extra = 1
    
class ArtGlossaryAdmin(admin.ModelAdmin):
	search_fields = ['tag']
	list_display=("tag","description")
admin.site.register(ArtGlossary,ArtGlossaryAdmin)

class TechnologyGlossaryInline(admin.TabularInline):
    model = TechnologyGlossary
    extra = 1
    
class TechnologyGlossaryAdmin(admin.ModelAdmin):
	search_fields = ['tag']
	list_display=("tag","description")
admin.site.register(TechnologyGlossary,TechnologyGlossaryAdmin)

class ActorProfileGlossaryInline(admin.TabularInline):
    model = ActorProfileGlossary
    extra = 1
    
class ActorProfileGlossaryAdmin(admin.ModelAdmin):
	search_fields = ['tag']
	list_display=("tag","description")
admin.site.register(ActorProfileGlossary,ActorProfileGlossaryAdmin)

class ActivityGlossaryInline(admin.TabularInline):
    model = ActivityGlossary
    extra = 1
    
class ActivityGlossaryAdmin(admin.ModelAdmin):
	search_fields = ['tag']
	list_display=("tag","description")
admin.site.register(ActivityGlossary,ActivityGlossaryAdmin)

admin.site.register(SourceGlossary)

# items


admin.site.register(Place)

class PhaseInline(admin.TabularInline):
    model = Phase
    #form = PhaseAdminForm
    exclude=("description",)
    extra = 1

class ActorAdmin(admin.ModelAdmin):
	search_fields = ['name','firstname']
	list_display=("__unicode__",)
	list_filter = ('profileTags','eat_member',)
	fieldsets = (("Bio", {'fields': (('name', 'firstname',),('birthdate','deathdate',),('url',))}),
	("tags",{'fields' : ('profileTags','technologyTags',)}),)
	filter_horizontal = ("technologyTags","profileTags",)
	#exclude=("places","relationships")
	inlines = (Actor_PlaceInline,)
admin.site.register(Actor,ActorAdmin)

class ActivityAdmin(admin.ModelAdmin):
	filter_horizontal = ("activityTags","technologyTags","artTags",)
	search_fields = ['name']
	list_filter = ('activityTags','artTags','technologyTags')
	fieldsets =(("activity" , {'fields':('name','activityTags','description','technologyTags','artTags')},),)
	#inlines=(PhaseInline,)
admin.site.register(Activity,ActivityAdmin)

class PhaseAdmin(admin.ModelAdmin):
	# form = PhaseAdminForm
	search_fields = ['activity']
	list_display=("__unicode__","start_date")
	list_filter = ('actionTags',)
	fieldsets = (("Define a Phase", {'fields': ('activity', ('start_date','end_date',) ,'actors', 'actionTags','places','description')}),)
	filter_horizontal = ("actionTags","actors","places",)
admin.site.register(Phase,PhaseAdmin)

class SourceAdmin(admin.ModelAdmin):
	search_fields = ['title','ref_bibliographic']
	list_display=("ref_bibliographic","date")
	list_filter = ('sourceTags',)
	fieldsets = (("References", {'fields': (('title',"date",),'ref_bibliographic','sourceTags','authors',)}),("document",{"fields":(('copyright','private_access'),'url')}),)
	filter_horizontal = ("sourceTags","authors",)
	#inlines=(AnnotationInline,)
admin.site.register(Source,SourceAdmin)
    
class AnnotationAdmin(admin.ModelAdmin):
	search_fields = ['title','text']
	list_display=("title","source","sourcemark")
	#list_filter = ('sourceTags',)
	fieldsets = (("References", {'fields': ('title',"source",'sourcemark','authors','text','image','phases')}),)
	filter_horizontal = ("authors","phases",)
	exclude=('actors','activities','places')
admin.site.register(Annotation,AnnotationAdmin)



# Titre anotation : titre automatique : phase.activity_source.year_anotation.author ou source.author_phase.actions 
# rendre choix de phase obligatoire
# Ajouter un fichier (image) a une annotation 
