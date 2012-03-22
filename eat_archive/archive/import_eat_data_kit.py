# csv2json.py
# 
# Copyright 2009 Brian Gershon -- briang at webcollective.coop
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import sys,os
import getopt
import csv
from os.path import dirname
from django.utils import simplejson as json
from datetime import datetime


def levenshtein(s1, s2):
# from http://code.activestate.com/recipes/576874-levenshtein-distance/
    l1 = len(s1)
    l2 = len(s2)

    matrix = [range(l1 + 1)] * (l2 + 1)
    for zz in range(l2 + 1):
      matrix[zz] = range(zz,zz + l1 + 1)
    for zz in range(0,l2):
      for sz in range(0,l1):
        if s1[sz] == s2[zz]:
          matrix[zz+1][sz+1] = min(matrix[zz+1][sz] + 1, matrix[zz][sz+1] + 1, matrix[zz][sz])
        else:
          matrix[zz+1][sz+1] = min(matrix[zz+1][sz] + 1, matrix[zz][sz+1] + 1, matrix[zz][sz] + 1)
    return matrix[l2][l1]
      



try:
    args = sys.argv
except ValueError:
    print "\nRun via:\n\n%s input_file_name model_name" % sys.argv[0]
    print "\ne.g. %s airport.csv app_airport.Airport" % sys.argv[0]
    print "\nNote: input_file_name should be a path relative to where this script is."
    sys.exit()

app_name = args[1]
input_files_directories = args[2:]
tags={}
for directory in input_files_directories :

	for input_file_name in os.listdir(directory) :
		
		(model_name,ext)=input_file_name.split(".")
		  
		if ext =="csv" :
			in_file = os.path.join( directory,input_file_name)
			out_file = os.path.join( "fixtures", model_name + ".json")
		
			print "Converting %s from CSV to JSON as %s" % (in_file, out_file)
			fo = open(out_file, 'w')
			entries = []
			f = open(in_file, 'r' )
			
			data = csv.DictReader(f)
		
			# header_row = []
		 	
		# 	
			# debugging
			# if model_name == 'app_airport.Airport':
			#     import pdb ; pdb.set_trace( )
			pk=0
			for data_dict in data :
				        
				model = model_name
				    
				row_dict = {}
				row_dict["pk"] = pk
				pk+=1
				row_dict["model"] = app_name+"."+model_name.lower() if app_name!="" else model_name
				for k,v in data_dict.iteritems() :
					try : 
						if v :
							# clean strip characters
							v=v.strip(" \n\t\r")
							# date recognition
							if "date" in k :
								try :
									_n=len(v.split("/"))
									if _n == 3 :
										date=datetime.strptime(v,"%d/%m/%Y").strftime("%Y-%m-%d")
									elif _n == 2 :
										date=datetime.strptime(v,"%m/%Y").strftime("%Y-%m-%d")
									elif _n == 1 :
											date=datetime.strptime(v,"%Y").strftime("%Y-%m-%d")			
									else :
										raise ValueError()
								except ValueError :
									print "ignoring bad date format at row "+str(pk)+ " in "+model_name
									date=None
								v=date
							# tag recognition
							if "Tags" in k and len(tags)>0:
								v_tags=v.split(",")
								v=[]
								for v_tag in v_tags :
									_k,tag,score=min( ( [_k,tag,levenshtein(v_tag.lower(),tag)] for tag,_k in tags.iteritems()),key=lambda _ : _[2])
									if score/len(tag)<0.2 :
										v_tag=_k
									else :
										print "ignoring bad TAG at row "+str(pk)+ " in "+model_name+" '"+v_tag+"' / '"+tag+"' "+str(score/len(tag))
									v.append(v_tag)
							data_dict[k]=v
							if "Glossary" in model_name :
								tags[v.lower()]=pk
					except Exception as e: 
						print "ignoring bad format at "+str(pk)+ " in "+model_name	
						raise		    			
				row_dict["fields"] = data_dict
				entries.append(row_dict)
			fo.write("%s" % json.dumps(entries,indent=4))
f.close()
fo.close()