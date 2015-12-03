//=====================================================
//Pallete
//=====================================================

extend(OntoUMLPallete,Pallete);
	
function OntoUMLPallete(){
	
	this.language = "OntoUML"

	this.elements = function(){
		var kind = this.createElement(joint.shapes.ontouml.Class,'Kind',10,10,'kind');	
		var collective = this.createElement(joint.shapes.ontouml.Class,'Collective',110, 10, 'collective');		
		var quantity = this.createElement(joint.shapes.ontouml.Class,'Quantity', 10, 60,'quantity');					
		var relator = this.createElement(joint.shapes.ontouml.Class,'Relator', 110, 60,'relator');	
		var mode = this.createElement(joint.shapes.ontouml.Class,'Mode',10, 110,'mode');		
		var quality = this.createElement(joint.shapes.ontouml.Class,'Quality', 110, 110,'quality');			
		var subkind = this.createElement(joint.shapes.ontouml.Class,'SubKind',10, 160,'subkind');	
		var role = this.createElement(joint.shapes.ontouml.Class,'Role',110, 160,'role');		
		var phase = this.createElement(joint.shapes.ontouml.Class,'Phase',10, 210,'phase');		
		var category = this.createElement(joint.shapes.ontouml.Class,'Category', 110, 210,'category');	
		var roleMixin = this.createElement(joint.shapes.ontouml.Class,'RoleMixin',10, 260,'roleMixin');		
		var phaseMixin = this.createElement(joint.shapes.ontouml.Class,'PhaseMixin',110, 260,'phaseMixin');	
		var mixin = this.createElement(joint.shapes.ontouml.Class,'Mixin',10, 310,'mixin');	
		var event = this.createElement(joint.shapes.ontouml.Class,'Event',110, 310,'event');	
		var highorder = this.createElement(joint.shapes.ontouml.Class,'HighOrder',10, 360,'highorder');	
		var domain = this.createElement(joint.shapes.ontouml.DataType,'Domain',110, 360,'domain');
		var dimension = this.createElement(joint.shapes.ontouml.DataType,'Dimension',10, 410,'dimension');	
		var enumeration = this.createElement(joint.shapes.ontouml.DataType,'Enumeration',110, 410,'enumeration');	
		return [kind, collective, quantity, relator, mode, quality, subkind, role, phase,category, roleMixin, phaseMixin, mixin, event, highorder, domain, dimension, enumeration];
	}		
}

//=====================================================
//Connections Suggestions
//=====================================================

extend(OntoUMLConnSuggestions,ConnSuggestions);
	
function OntoUMLConnSuggestions(){
	
	this.language = "OntoUML"
		
	this.defaultConnections = function(){
		generalization = new joint.shapes.ontouml.Generalization();
		mediation = new joint.shapes.ontouml.Relationship(); mediation.setStereotype("mediation");
		characterization = new joint.shapes.ontouml.Relationship(); characterization.setStereotype("characterization");
		structuration = new joint.shapes.ontouml.Relationship(); structuration.setStereotype("structuration");
		formal = new joint.shapes.ontouml.Relationship(); formal.setStereotype("formal");
		material = new joint.shapes.ontouml.Relationship(); material.setStereotype("material");
		derivation = new joint.shapes.ontouml.Relationship(); derivation.setStereotype("derivation");
		componentOf = new joint.shapes.ontouml.Relationship(); componentOf.setStereotype("componentOf");
		memberOf = new joint.shapes.ontouml.Relationship(); memberOf.setStereotype("memberOf");
		subCollectionOf = new joint.shapes.ontouml.Relationship(); subCollectionOf.setStereotype("subCollectionOf");
		subQuantityOf = new joint.shapes.ontouml.Relationship(); subQuantityOf.setStereotype("subQuantityOf");		
		quaPartOf = new joint.shapes.ontouml.Relationship(); quaPartOf.setStereotype("quaPartOf");
		constitution = new joint.shapes.ontouml.Relationship(); constitution.setStereotype("constitution");
		causation = new joint.shapes.ontouml.Relationship(); causation.setStereotype("causation");
		participation = new joint.shapes.ontouml.Relationship(); participation.setStereotype("participation");
		subEventOf = new joint.shapes.ontouml.Relationship(); subEventOf.setStereotype("subEventOf");
		temporal = new joint.shapes.ontouml.Relationship(); temporal.setStereotype("temporal");
		instanceOf = new joint.shapes.ontouml.Relationship(); instanceOf.setStereotype("instanceOf");
		this.map = { 
			'Generalization': generalization, 
			'Mediation': mediation, 
			'Characerization': characterization, 
			'Structuration': structuration,
			'Formal': formal, 
			'Material': material, 
			'Derivation': derivation, 
			'ComponentOf': componentOf,
			'MemberOf': memberOf,
			'SubCollectionOf': subCollectionOf, 
			'SubQuantityOf': subQuantityOf,
			'QuapartOf': quaPartOf, 
			'Constitution': constitution, 
			'Causation': causation,
			'Participation': participation, 
			'SubeventOf': subEventOf, 
			'Temporal': temporal, 
			'InstanceOf': instanceOf	
		}		
	};
}

//=====================================================
//Runnin example
//=====================================================

function runningExample(canvas){
	var forest = new joint.shapes.ontouml.Class({	
        name: 'Forest',
		stereotype:'collective',
        attributes: ['name: String'],
        position: { x: 100, y: 130 }
    });
	var tree = new joint.shapes.ontouml.Class({	
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
	canvas.getGraph().addCells([forest, tree, entity, color, link, link2, material]);
	
	//var derivation = material.setTruthMaker(graph, forest.id)
	//graph.addCells([derivation])
}