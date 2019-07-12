// Mathieu Jacomy @ Sciences Po Médialab & WebAtlas
// version 0.28
var json_graph_api = {
	parseGEXF: function(gexf){
		var viz_error="http:///www.gexf.net/1.1draft/viz";	// Vis namespace (there was an error sooner)
		var viz="http://www.gexf.net/1.2draft/viz";	// Vis namespace
		
		// Parse Attributes
		// This is confusing, so I'll comment heavily
		var nodesAttributes = [];	// The list of attributes of the nodes of the graph that we build in json
		var edgesAttributes = [];	// The list of attributes of the edges of the graph that we build in json
		var attributesNodes = gexf.getElementsByTagName("attributes");	// In the gexf (that is an xml), the list of xml nodes "attributes" (note the plural "s")
		
		for(i = 0; i<attributesNodes.length; i++){
			var attributesNode = attributesNodes[i];	// attributesNode is each xml node "attributes" (plural)
			if(attributesNode.getAttribute("class") == "node"){
				var attributeNodes = attributesNode.getElementsByTagName("attribute");	// The list of xml nodes "attribute" (no "s")
				for(ii = 0; ii<attributeNodes.length; ii++){
					var attributeNode = attributeNodes[ii];	// Each xml node "attribute"
					
					var id = attributeNode.getAttribute("id"),
						title = attributeNode.getAttribute("title"),
						type = attributeNode.getAttribute("type");
					
					var attribute = {id:id, title:title, type:type};
					nodesAttributes.push(attribute);
					
				}
			} else if(attributesNode.getAttribute("class") == "edge"){
				var attributeNodes = attributesNode.getElementsByTagName("attribute");	// The list of xml nodes "attribute" (no "s")
				for(ii = 0; ii<attributeNodes.length; ii++){
					var attributeNode = attributeNodes[ii];	// Each xml node "attribute"
					
					var id = attributeNode.getAttribute("id"),
						title = attributeNode.getAttribute("title"),
						type = attributeNode.getAttribute("type");
						
					var attribute = {id:id, title:title, type:type};
					edgesAttributes.push(attribute);
					
				}
			}
		}
		
		var nodes = [];	// The nodes of the graph
		var nodesNodes = gexf.getElementsByTagName("nodes")	// The list of xml nodes "nodes" (plural)
		
		for(i=0; i<nodesNodes.length; i++){
			var nodesNode = nodesNodes[i];	// Each xml node "nodes" (plural)
			var nodeNodes = nodesNode.getElementsByTagName("node");	// The list of xml nodes "node" (no "s")
			for(ii=0; ii<nodeNodes.length; ii++){
				var nodeNode = nodeNodes[ii];	// Each xml node "node" (no "s")
				
				var id = nodeNode.getAttribute("id");
				var label = nodeNode.getAttribute("label") || nodeNode.getAttribute("name") || id;
				
				//viz
				var size = 1;
				var x = 50 - 100*Math.random();
				var y = 50 - 100*Math.random();
				var color = {r:180, g:180, b:180};
				
				var sizeNodes = nodeNode.getElementsByTagNameNS(viz, "size");
				if(sizeNodes.length==0)	// Taking in account a previous error of Gephi
					sizeNodes = nodeNode.getElementsByTagNameNS(viz_error, "size");
				if(sizeNodes.length>0){
					sizeNode = sizeNodes[0];
					size = parseFloat(sizeNode.getAttribute("value"));
				}
				var positionNodes = nodeNode.getElementsByTagNameNS(viz, "position");
				if(positionNodes.length==0)	// Taking in account a previous error of Gephi
					positionNodes = nodeNode.getElementsByTagNameNS(viz_error, "position");
				if(positionNodes.length>0){
					var positionNode = positionNodes[0];
					x = parseFloat(positionNode.getAttribute("x"));
					y = -parseFloat(positionNode.getAttribute("y"));
				}
				var colorNodes = nodeNode.getElementsByTagNameNS(viz, "color");
				if(colorNodes.length==0)	// Taking in account a previous error of Gephi
					colorNodes = nodeNode.getElementsByTagNameNS(viz_error, "color");
				if(colorNodes.length>0){
					colorNode = colorNodes[0];
					color.r = parseInt(colorNode.getAttribute("r"));
					color.g = parseInt(colorNode.getAttribute("g"));
					color.b = parseInt(colorNode.getAttribute("b"));
				}
				
				// Create Node
				var node = {id:id, label:label, size:size, x:x, y:y, color:color, attributes:[]};	// The graph node
				
				// Attribute values
				var attvalueNodes = nodeNode.getElementsByTagName("attvalue");
				for(iii=0; iii<attvalueNodes.length; iii++){
					var attvalueNode = attvalueNodes[iii];
					var attr = attvalueNode.getAttribute("for");
					var val = attvalueNode.getAttribute("value");
					node.attributes.push({attr:attr, val:val});
				}
				nodes.push(node);
			}
		}

		var edges = [];
		var edgesNodes = gexf.getElementsByTagName("edges");
		for(i=0; i<edgesNodes.length; i++){
			var edgesNode = edgesNodes[i];
			var edgeNodes = edgesNode.getElementsByTagName("edge");
			for(ii=0; ii<edgeNodes.length; ii++){
				var edgeNode = edgeNodes[ii];
				var source = edgeNode.getAttribute("source");
				var target = edgeNode.getAttribute("target");
				var edge = {id:ii, sourceID:source, targetID:target, attributes:[]};
				var attvalueNodes = edgeNode.getElementsByTagName("attvalue");
				for(iii=0; iii<attvalueNodes.length; iii++){
					var attvalueNode = attvalueNodes[iii];
					var attr = attvalueNode.getAttribute("for");
					var al = attvalueNode.getAttribute("value");
					edge.attributes.push({attr:attr, val:val});
				}
				edges.push(edge);
			}
		}
		
		return {nodesAttributes:nodesAttributes, edgesAttributes:edgesAttributes, nodes:nodes, edges:edges};
	},
	
	buildGEXF: function(graph){
		// Blob Builder
		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
		var bb = new BlobBuilder;
		
		var today = new Date();
		
		bb.append('<?xml version="1.0" encoding="UTF-8"?><gexf xmlns="http://www.gexf.net/1.2draft" version="1.2" xmlns:viz="http://www.gexf.net/1.2draft/viz" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.gexf.net/1.2draft http://www.gexf.net/1.2draft/gexf.xsd">');
		bb.append("\n" +  '<meta lastmodifieddate="'+today+'"><author>'+json_graph_api.xmlEntities((graph.attributes && graph.attributes.author) || '')+'</author><description>'+json_graph_api.xmlEntities((graph.attributes && graph.attributes.description) || '')+'</description></meta>');
		bb.append("\n" +  '<graph defaultedgetype="directed" mode="static">');
		
		// Nodes Attributes
		bb.append("\n" +  '<attributes class="node" mode="static">');
		graph.nodesAttributes.forEach(function(nodeAttribute){
			bb.append("\n" +  '<attribute id="'+json_graph_api.xmlEntities(nodeAttribute.id)+'" title="'+json_graph_api.xmlEntities(nodeAttribute.title)+'" type="'+json_graph_api.xmlEntities(nodeAttribute.type)+'"></attribute>');
		});
		bb.append("\n" +  '</attributes>');
		
		// Edges Attributes
		bb.append("\n" +  '<attributes class="edge" mode="static">');
		graph.edgesAttributes.forEach(function(edgeAttribute){
			bb.append("\n" +  '<attribute id="'+json_graph_api.xmlEntities(edgeAttribute.id)+'" title="'+json_graph_api.xmlEntities(edgeAttribute.title)+'" type="'+json_graph_api.xmlEntities(edgeAttribute.type)+'"></attribute>');
		});
		bb.append("\n" +  '</attributes>');
		
		// Nodes
		bb.append("\n" +  '<nodes>');
		graph.nodes.forEach(function(node){
			var id = json_graph_api.xmlEntities(node.id);
			var label = node.label || '';
			
			bb.append("\n" +  '<node id="'+id+'" label="'+json_graph_api.xmlEntities(label)+'">');
			
			// AttributeValues
			bb.append("\n" +  '<attvalues>');
			node.attributes.forEach(function(nodeAttribute){
				bb.append("\n" +  '<attvalue for="'+json_graph_api.xmlEntities(nodeAttribute.attr)+'" value="'+json_graph_api.xmlEntities(nodeAttribute.val)+'"></attvalue>');
			});
			
			bb.append("\n" +  '</attvalues>');
			
			if(node.size)
				bb.append("\n" +  '<viz:size value="'+node.size+'"></viz:size>');
			if(node.x && node.y)
				bb.append("\n" +  '<viz:position x="'+node.x+'" y="'+(-node.y)+'"></viz:position>');
			if(node.color)
				bb.append("\n" +  '<viz:color r="'+Math.round(node.color.r)+'" g="'+Math.round(node.color.g)+'" b="'+Math.round(node.color.b)+'"></viz:color>');
			
			bb.append("\n" +  '</node>');
			
		});
		bb.append("\n" +  '</nodes>');
		
		// Edges
		bb.append("\n" +  '<edges>');
		graph.edges.forEach(function(edge){
			var sourceId = json_graph_api.xmlEntities(edge.sourceID);
			var targetId = json_graph_api.xmlEntities(edge.targetID);
			
			bb.append("\n" +  '<edge source="'+sourceId+'" target="'+targetId+'" >');
			
			// AttributeValues
			bb.append("\n" +  '<attvalues>');
			edge.attributes.forEach(function(edgeAttribute){
				bb.append("\n" +  '<attvalue for="'+json_graph_api.xmlEntities(edgeAttribute.attr)+'" value="'+json_graph_api.xmlEntities(edgeAttribute.val)+'"></attvalue>');
			});
			
			bb.append("\n" +  '</attvalues>');
			bb.append("\n" +  '</edge>');
			
		});
		bb.append("\n" +  '</edges>');
		
		bb.append("\n" +  '</graph></gexf>');
		
		// Finalization
		return bb.getBlob("text/gexf+xml;charset=utf-8");
	},
	
	buildIndexes: function(graph){
		// Index the attributes-values by attribute Id in each node
		graph.nodes.forEach(function(node){
			node.attributes_byId = {};
			node.attributes.forEach(function(attvalue){
				node.attributes_byId[attvalue.attr] = attvalue.val;
			});
		});
		
		// Index the attributes-values by attribute Id in each edge
		graph.edges.forEach(function(edge){
			edge.attributes_byId = {};
			edge.attributes.forEach(function(attvalue){
				edge.attributes_byId[attvalue.attr] = attvalue.val;
			});
		});
		
		// Index the nodes by Id
		graph.nodes_byId = {};
		graph.nodes.forEach(function(node){
			graph.nodes_byId[node.id] = node;
		});
		
		// Index the attributes by Id
		graph.nodesattributes_byId = {};
		graph.nodesAttributes.forEach(function(att){
			graph.nodesattributes_byId[att.id] = att;
		});
		graph.edgesattributes_byId = {};
		graph.edgesAttributes.forEach(function(att){
			graph.edgesattributes_byId[att.id] = att;
		});
		
		// Init the edges for each node
		graph.nodes.forEach(function(node){
			node.inEdges = [];
			node.outEdges = [];
		});
		
		// Index the edges for each node
		graph.edges.forEach(function(edge){
			graph.nodes_byId[edge.sourceID].outEdges.push(edge);
			graph.nodes_byId[edge.targetID].inEdges.push(edge);
		});
		
		// Index the source and target node for each edge
		graph.edges.forEach(function(edge){
			edge.source = graph.nodes_byId[edge.sourceID];
			edge.target = graph.nodes_byId[edge.targetID];
		});
	},
	
	xmlEntities: function(expression) {
		expression = expression || "";
		return String(expression).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	},
	
	getBackbone: function(graph, removeHidden){
		if(removeHidden === undefined)
			removeHidden = false;
		return {
			attributes:{
				title:(graph.attributes && graph.attributes.title) || 'My Network',
				author:(graph.attributes && graph.attributes.author) || 'Unknown Author',
				description:(graph.attributes && graph.attributes.description) || ''
			},
			nodesAttributes:graph.nodesAttributes.map(function(na){
				return {
					id: na.id,
					title: na.title,
					type: na.type
				}
			}),
			edgesAttributes:graph.edgesAttributes.map(function(ea){
				return {
					id: ea.id,
					title: ea.title,
					type: ea.type
				}
			}),
			nodes:graph.nodes.filter(function(n){
				return !removeHidden || !n.hidden;
			}).map(function(n){
				var node = {
					id: n.id,
					label: n.label,
					attributes: n.attributes.map(function(a){
						return {
							attr: a.attr,
							val: a.val
						};
					}),
				};
				if(n.x && n.y){
					node.x = n.x;
					node.y = n.y;
				}
				if(n.size)
					node.size = n.size;
				if(n.color)
					node.color = n.color;
				return node;
			}),
			edges:graph.edges.filter(function(e){
				return !removeHidden || (!e.source.hidden && !e.target.hidden);
			}).map(function(e){
				return {
					id: e.id,
					sourceID: e.sourceID,
					targetID: e.targetID,
					attributes: e.attributes.map(function(a){
						return {
							attr: a.attr,
							val: a.val
						};
					}),
				};
			})
		};
	},
	
	storeGraph: function(graph){
		sessionStorage['network'] = JSON.stringify(json_graph_api.getBackbone(graph));
	},
	
	retrieveGraph: function(){
		var txtgraph = sessionStorage.getItem('network');
		return eval('(' + txtgraph + ')');
	}
}
