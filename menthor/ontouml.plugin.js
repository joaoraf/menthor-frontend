extend(OntoUMLPallete,Pallete);
extend(OntoUMLConnect,Connect);

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
		var genset = this.createElement(joint.shapes.ontouml.GeneralizationSet,'',10, 460, null);
		genset.set('size',{width: 195, height: 20});
		return [kind, collective, quantity, relator, mode, quality, subkind, role, phase,
		category, roleMixin, phaseMixin, mixin, event, highorder, domain, dimension, enumeration, genset];
	}		
}
	
function OntoUMLConnect(){
	this.language = "OntoUML"
	this.defaultConnections = function(){
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
	console.log(link2.toString());
	
	var genSet = new joint.shapes.ontouml.GeneralizationSet({
		isDisjoint: true,
		isCovering: true,
	});	
	
	canvas.getGraph().addCells([forest, tree, entity, color, link, link2, material, genSet]);
		
	//workaraound to draw derivations
	material.setTruthMaker(canvas, forest.id)	
	
	//workaraound to link genSets to its generalizations
	genSet.setGeneralizations(canvas, [link2]);			
}