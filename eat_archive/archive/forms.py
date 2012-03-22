# from django import forms
# 
# import selectable.forms as selectable
# 
# from lookups import *
# from models import *
# 
# class ActorForm(forms.ModelForm):
#     class Meta(object):
# 		model = Actor_Actor
# 		widgets = {
# 		   	 'actor2' : selectable.AutoComboboxSelectWidget(lookup_class=ActorLookup),  
# 		 }
# 
# 
# class PhaseAdminForm(forms.ModelForm):
#     
#     
#     class Meta(object):
# 		model = Phase
# 		widgets = {
# 		     'activity': selectable.AutoCompleteWidget(lookup_class=ActivityLookup,allow_new=False),
# 		     'actors' : selectable.AutoComboboxSelectMultipleWidget(lookup_class=ActorLookup,position='bottom-inline'),
# 		     'actionTags' : selectable.AutoComboboxSelectMultipleWidget(lookup_class=ActionLookup,position='bottom-inline'),
# 		     'places' : selectable.AutoComboboxSelectMultipleWidget(lookup_class=PlaceLookup,position='bottom-inline'),
# 		     
# 		 }
# 		
  