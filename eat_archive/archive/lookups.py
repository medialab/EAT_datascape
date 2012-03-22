from selectable.base import ModelLookup
from selectable.registry import registry

from archive.models import *


class ActorLookup(ModelLookup):
    model = Actor
    search_field = 'name__icontains'

registry.register(ActorLookup)

class ActivityLookup(ModelLookup):
	model = Activity
	search_field = 'name__icontains'
	
	def get_item_id(self,item) :
		return item.name
	
registry.register(ActivityLookup)

class ActionLookup(ModelLookup):
	model = ActionGlossary
	search_field = 'tag__icontains'
	
registry.register(ActionLookup)
	
	
class PlaceLookup(ModelLookup):
	model = Place
	search_field = 'name__icontains'
	
registry.register(PlaceLookup)
