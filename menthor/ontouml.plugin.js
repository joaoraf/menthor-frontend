
extend(OntoUMLPallete,Pallete);
function OntoUMLPallete(){
	
	this.language = "OntoUML"
	
	/** override shapes */
	this.shapes = function(){		
		var kind = this.createShape(joint.shapes.ontouml.Class,10,10, OntoUMLClass, 'kind', 'Kind');
		var collective = this.createShape(joint.shapes.ontouml.Class,110, 10, OntoUMLClass,'collective','Collective');	
		var quantity = this.createShape(joint.shapes.ontouml.Class,10, 60,OntoUMLClass, 'quantity', 'Quantity');					
		var relator = this.createShape(joint.shapes.ontouml.Class, 110, 60,OntoUMLClass, 'relator', 'Relator');	
		var mode = this.createShape(joint.shapes.ontouml.Class,10, 110,OntoUMLClass, 'mode','Mode');		
		var quality = this.createShape(joint.shapes.ontouml.Class,110, 110,OntoUMLClass, 'quality', 'Quality');			
		var subkind = this.createShape(joint.shapes.ontouml.Class,10, 160,OntoUMLClass,'subkind', 'SubKind');	
		var role = this.createShape(joint.shapes.ontouml.Class,110, 160,OntoUMLClass,'role', 'Role');		
		var phase = this.createShape(joint.shapes.ontouml.Class,10, 210,OntoUMLClass,'phase','Phase');		
		var category = this.createShape(joint.shapes.ontouml.Class, 110, 210,OntoUMLClass,'category','Category');	
		var roleMixin = this.createShape(joint.shapes.ontouml.Class,10, 260,OntoUMLClass,'roleMixin','RoleMixin');		
		var phaseMixin = this.createShape(joint.shapes.ontouml.Class,110, 260,OntoUMLClass,'phaseMixin','PhaseMixin');	
		var mixin = this.createShape(joint.shapes.ontouml.Class,10, 310,OntoUMLClass,'mixin','Mixin');	
		var event = this.createShape(joint.shapes.ontouml.Class,110, 310,OntoUMLClass,'event','Event');	
		var highorder = this.createShape(joint.shapes.ontouml.Class,10, 360,OntoUMLClass,'highorder','HighOrder');	
		var domain = this.createShape(joint.shapes.ontouml.DataType,110, 360,OntoUMLDataType, 'domain','Domain');
		var dimension = this.createShape(joint.shapes.ontouml.DataType,10, 410,OntoUMLDataType,'dimension','Dimension');	
		var enumeration = this.createShape(joint.shapes.ontouml.DataType,110, 410,OntoUMLDataType, 'enumeration', 'Enumeration');	
		var genset = this.createShape(joint.shapes.ontouml.GeneralizationSet,10, 460, OntoUMLGeneralizationSet, null, '');
		genset.set('size',{width: 195, height: 20});
		return [kind, collective, quantity, relator, mode, quality, subkind, role, phase,
		category, roleMixin, phaseMixin, mixin, event, highorder, domain, dimension, enumeration, genset];
	}
	
	/** create both shape and content of a pallete element */
	this.createShape = function(shape_type, x, y, lang_type, stereotype, name){
		var elemContent = new lang_type(); elemContent.name = name; elemContent.stereotype = stereotype;
		var elemShape = new shape_type({ position: {x: x,y: y}, content: elemContent	});
		return elemShape;
	}	
}
	
extend(OntoUMLConnectContextMenu,ConnectContextMenu);
function OntoUMLConnectContextMenu(){
	
	this.language = "OntoUML"
	
	/** override connections in the context menu */
	this.map = { 
		'Generalization': 'joint.shapes.ontouml.Generalization', 
		'Mediation': 'joint.shapes.ontouml.Relationship', 
		'Characerization': 'joint.shapes.ontouml.Relationship', 
		'Structuration': 'joint.shapes.ontouml.Relationship',
		'Formal': 'joint.shapes.ontouml.Relationship', 
		'Material': 'joint.shapes.ontouml.Relationship', 
		'ComponentOf': 'joint.shapes.ontouml.Relationship',
		'MemberOf': 'joint.shapes.ontouml.Relationship',
		'SubCollectionOf': 'joint.shapes.ontouml.Relationship', 
		'SubQuantityOf': 'joint.shapes.ontouml.Relationship',
		'QuapartOf': 'joint.shapes.ontouml.Relationship', 
		'Constitution': 'joint.shapes.ontouml.Relationship', 
		'Causation': 'joint.shapes.ontouml.Relationship',
		'Participation': 'joint.shapes.ontouml.Relationship', 
		'SubeventOf': 'joint.shapes.ontouml.Relationship', 
		'Temporal': 'joint.shapes.ontouml.Relationship', 
		'InstanceOf': 'joint.shapes.ontouml.Relationship'	
	}	
	
	/** create N connection shapes with their content */
	this.createConnections = function (menukey, numberOfConnections) {
		var conns = [];
		var shape_type = eval(this.map[this.items()[menukey].name]);
		var stereotype = (String(menukey)).toLowerCase();
		for(var i=0; i<numberOfConnections; i++){
			var elemContent = new OntoUMLRelationship();
			if(stereotype==="generalization") elemContent = new OntoUMLGeneralization();			
			else elemContent.stereotype = stereotype;
			var elemShape = new shape_type({content: elemContent});
			conns.push(elemShape);
		};
		return conns
	};	
}

extend(OntoUMLRightClickContextMenu, RightClickContextMenu);
function OntoUMLRightClickContextMenu(){
	
	this.language = "OntoUML"
	
	this.action = function(evt, key, cellView, canvas){
		this.$super.action.call(this, evt, key, cellView, canvas)
		if(key=="derivedfrom") this.derivedFrom(evt, cellView, canvas);
	};
	
	this.items = function(cellView){
		var map = this.$super.items.call(this,cellView);
		if(cellView.model instanceof joint.shapes.ontouml.Relationship){
			if(cellView.model.getStereotypeName()=="material") map["derivedfrom"] = { name: "Derived From"};
		}
		return map;
	};	
	
	this.derivedFrom = function(evt, cellView, canvas){
		if(cellView.model instanceof joint.shapes.ontouml.Relationship){
			if(cellView.model.getStereotypeName()=="material"){					
				canvas.dragDerivation(cellView, evt);
			}
		}
	};	
}

extend(OntoUMLEditor, Editor);
function OntoUMLEditor(){	

	/** override context menus */
	this.connectMenu = new OntoUMLConnectContextMenu();	
	this.rightClickMenu = new OntoUMLRightClickContextMenu();
	
	this.deleteShape = function(shape){	
		/** delete the derivation if the material is deleted */
		var links = this.canvas.getGraph().getConnectedLinks(shape);	
		if(shape instanceof joint.dia.Link) links.push(shape);		
		_.each(links, (function(link){			
			if(link instanceof joint.shapes.ontouml.Relationship){
				if(link.getStereotypeName()=="material"){					
					if(!_.isEmpty(link.get('derivation'))){
						var derivationView = this.canvas.getPaper().findViewByModel(link.get('derivation'));
						this.$super.deleteShape.call(this,derivationView.model);						
					}
				}
			}
		}).bind(this));
		/** delete shape */
		this.$super.deleteShape.call(this,shape);
	};
}

extend(OntoUMLCanvas, Canvas);
function OntoUMLCanvas(){
	
	this.language = "OntoUML";
	
	/** override the editor */
	this.editor = new OntoUMLEditor();
	
	this.setDerivation = function(materialView, truthMakerId){		
		if(truthMakerId!=null){
			var graph = this.getGraph();
			var paper = this.getPaper();
			materialView.model.set('derivation', new joint.shapes.ontouml.Relationship({
				stereotype:'derivation',
				source: midPoint(materialView),
				target: { id: truthMakerId },
			}));
			materialView.model.on('add change:vertices change:router', function(){
				materialView.model.get('derivation').set('source',midPoint(materialView));				
			});
			graph.getCell(materialView.model.get('target').id).on('add change:position', function(){
				materialView.model.get('derivation').set('source', midPoint(materialView));
			});
			graph.addCells([materialView.model.get('derivation')]);
		}	
	};		
			
	this.dragDerivation = function(materialView, evt){
		var graph = this.getGraph();
		var paper = this.getPaper();
		materialView.model.set('derivation', new joint.shapes.ontouml.Relationship({
			stereotype:'derivation',
			source: midPoint(materialView),			
		}));
		materialView.model.get('derivation').set('target',paper.snapToGrid({x: evt.clientX, y: evt.clientY}));
		graph.addCell(materialView.model.get('derivation'), {validation: false});
		var linkView = paper.findViewByModel(materialView.model.get('derivation'));
		linkView.startArrowheadMove("target");
		$("body").mouseup(function(evt){		
			linkView.pointerup(evt);
			$("body").unbind();
			materialView.model.get('derivation').set('source',midPoint(materialView));
		});
		$("body").mousemove(function(evt){
			var coords = paper.snapToGrid({
				x: evt.clientX,
				y: evt.clientY
			});
			linkView.pointermove(evt, coords.x, coords.y)
		});
		materialView.model.on('add change:vertices change:router', function(){
			materialView.model.get('derivation').set('source',midPoint(materialView));				
		});
		graph.getCell(materialView.model.get('source').id).on('add change:position', function(){
			materialView.model.get('derivation').set('source',midPoint(materialView));
		});
		graph.getCell(materialView.model.get('target').id).on('add change:position', function(){
			materialView.model.get('derivation').set('source', midPoint(materialView));
		});
	};
}

//=====================================================
//Runnin example
//=====================================================

function runningExample(canvas){
	
	/** abstract syntax */
	var forest = new OntoUMLClass();
	forest.name = 'Forest';	
	forest.stereotype = 'collective';
	var attribute = new MAttribute();
	attribute.name = 'name';
	attribute.stereotype = 'String';
	attribute.multiplicity = '1';
	forest.attributes.push(attribute);
	attribute.owner = forest;
		
	/**concrete syntax for the forest */
	var forestShape = new joint.shapes.ontouml.Class({	
        content: forest,       
        position: { x: 100, y: 130 }
    });	
	var forestShape2 = new joint.shapes.ontouml.Class({	
        position: { x: 150, y: 130 }
    });	
	
	canvas.getGraph().addCells([forestShape, forestShape2]);
	
	/*var tree = new joint.shapes.ontouml.Class({	
        name: 'Tree',
		stereotype:'kind',
        position: { x: 400, y: 140 }
    });	
	var entity = new joint.shapes.ontouml.Class({	
        name: 'Entity',
		stereotype: 'category',       
        position: { x: 380, y: 50 }
    });	
	var color = new joint.shapes.ontouml.DataType({	
        name: 'Color',
		stereotype: 'quality',       
        position: { x: 530, y: 50 }
    });	
	var link = new joint.shapes.ontouml.Relationship({
        source: { id: forest.id },
        target: { id: tree.id },
		stereotype: 'memberOf',
    });	
	var material = new joint.shapes.ontouml.Relationship({
        source: { id: color.id },
        target: { id: tree.id },
		stereotype: 'material',
    });		
    var link2 = new joint.shapes.ontouml.Generalization({
        source: { id: tree.id },
        target: { id: entity.id }
    });	
	console.log(link2.toString());
	
	var genSet = new joint.shapes.ontouml.GeneralizationSet({
		isDisjoint: true,
		isCovering: true,
	});	
	
	canvas.getGraph().addCells([forest, tree, entity, color, link, link2, material, genSet]);*/
}