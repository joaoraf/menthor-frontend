joint.shapes.ontouml = {};

/** OntoUML Generalization Set */
joint.shapes.ontouml.GeneralizationSet = joint.shapes.mcore.MGeneralizationSet.extend({
	type: 'joint.shapes.ontouml.GeneralizationSet',	
});

/** OntoUML Generalization */
joint.shapes.ontouml.Generalization = joint.shapes.mcore.MGeneralization.extend({
	type: 'joint.shapes.ontouml.Generalization',	
});

/** OntoUML Relationship */
joint.shapes.ontouml.Relationship = joint.shapes.mcore.MRelationship.extend({
	
	defaults: joint.util.deepSupplement({ 
		type: 'joint.shapes.ontouml.Relationship',		
		stereotype: [],
		derivation: [],
		essentialPart: false,
		immutablePart: false,
		immutableWhole: false,
		inseparablePart: false,
		shareable: false,
	}, joint.shapes.mcore.MRelationship.prototype.defaults),
		
	getStereotype: function() {
		if(this.get('stereotype')!=null && this.get('stereotype')!=""){
			return "\u00AB"+this.get('stereotype')+"\u00BB";
		}else{
			return "";
		}
    },
	
	setStereotype: function(stereo) {
        this.set('stereotype', stereo);
    },
	
	getStereotypeName: function() {
        return String(this.get('stereotype'));
    },
	
	isShareable: function() {
        return this.get('shareable');
    },
	
	isPartEssential: function() {
        return this.get('essentialPart');
    },
	
	isWholeImmutable: function() {
        return this.get('immutableWhole');
    },
	
	isPartInseparable: function() {
        return this.get('inseparablePart');
    },

	isPartImmutable: function() {
        return this.get('immutablePart');
    },
	
	getFullLabelName: function(){
		return this.getName()+"\n"+this.getStereotype()
	},
	
	updateStereotypeLabel: function(){					
		var txt = this.getStereotype();
		if(this.getStereotypeName()=='derivation') txt = ""
		this.label(3, {
			position: 0.5,
			attrs: {
				rect: { fill: 'white' }, text: { dy: 10, fill: 'black', 'font-family': 'Arial', 'font-size':12, text: txt }
			},
		});				
	},
	
	getMetaAttributesLabelName: function(){
		if(this.isPartEssential() && this.isWholeImmutable()) return "{essentialPart, immutableWhole}"
		if(this.isPartEssential() && this.isPartInseparable()) return "{essentialPart, inseparablePart}"
		if(this.isPartEssential()) return "{essentialPart}"
		if(this.isPartImmutable() && this.isWholeImmutable()) return "{immutablePart, immutableWhole}"
		if(this.isPartImmutable() && this.isPartInseparable()) return "{immutablePart, inseparablePart}"
		if(this.isPartImmutable()) return "{immutablePart}"
		if(this.isWholeImmutable()) return "{immutableWhole}"
		if(this.isPartInseparable()) return "{inseparablePart}"
	},
		
	updateMetaAttributeLabels: function(){
		this.label(4, {
            position: 0.5,
            attrs: {
                rect: { fill: 'white' }, text: { fill: 'black', 'font-family': 'Arial', 'font-size':12, text: this.getMetaAttributesLabelName() }
            },
        });	
	},
	
	dragTruthMaker: function(canvas, evt){
		var graph = canvas.getGraph();
		var paper = canvas.getPaper();
		this.derivation = new joint.shapes.ontouml.Relationship({
			stereotype:'derivation',
			source: { x: midPoint(graph, this).x, y:midPoint(graph, this).y },			
		});
		this.derivation.set('target',paper.snapToGrid({x: evt.clientX, y: evt.clientY}));
		graph.addCell(this.derivation, {validation: false});
		var linkView = paper.findViewByModel(this.derivation);
		linkView.startArrowheadMove("target");
		$("body").mouseup((function(evt){		
			linkView.pointerup(evt);
			$("body").unbind();
			this.derivation.set('source',{ x: midPoint(graph, this).x, y:midPoint(graph, this).y });
		}).bind(this));
		$("body").mousemove(function(evt){
			var coords = paper.snapToGrid({
				x: evt.clientX,
				y: evt.clientY
			});
			linkView.pointermove(evt, coords.x, coords.y)
		});	
		graph.getCell(this.get('source').id).on('add change:position', function(){
			this.derivation.set('source', { x: midPoint(graph, this).x, y: midPoint(graph, this).y });
		}, this);
		graph.getCell(this.get('target').id).on('add change:position', function(){
			this.derivation.set('source', { x: midPoint(graph, this).x, y: midPoint(graph, this).y });
		}, this);
	},
	
	setTruthMaker: function(canvas, truthMakerId){
		if(truthMakerId!=null){
			var graph = canvas.getGraph();
			var paper = canvas.getPaper();
			this.derivation = new joint.shapes.ontouml.Relationship({
				stereotype:'derivation',
				source: { x: midPoint(graph, this).x, y:midPoint(graph, this).y },
				target: { id: truthMakerId },
			});
			graph.getCell(this.get('source').id).on('add change:position', function(){
				this.derivation.set('source', { x: midPoint(graph, this).x, y: midPoint(graph, this).y });
			}, this);
			graph.getCell(this.get('target').id).on('add change:position', function(){
				this.derivation.set('source', { x: midPoint(graph, this).x, y: midPoint(graph, this).y });
			}, this);
			graph.addCells([this.derivation]);
		}	
	},		
		
	updateShape: function(){
		if(this.getStereotypeName().toLowerCase()== 'componentof' || this.getStereotypeName().toLowerCase()== 'memberof'
		|| this.getStereotypeName().toLowerCase()== 'subcollectionof' || this.getStereotypeName().toLowerCase()== 'subquantityof'
		|| this.getStereotypeName().toLowerCase()== 'subeventof' || this.getStereotypeName().toLowerCase()== 'constitution'
		|| this.getStereotypeName().toLowerCase()== 'quapartof'){	
			var color = 'white'
			if(!this.isShareable()) color = 'black'
			this.attr('.marker-source', { d: 'M 20 8 L 10 0 L 0 8 L 10 16 z', fill: color});			
		}else if(this.getStereotypeName().toLowerCase()=='derivation'){				
			this.attr('.connection', { 'stroke-dasharray': '5,5' });		
			this.attr('.marker-target', { d: 'M-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0', fill: color});	
			this.toBack();
		} else if(this.getStereotypeName().toLowerCase=='material'){
			setTruthMaker(null);
		}	
	},
	
	initialize: function() {
		
		joint.shapes.mcore.MRelationship.prototype.initialize.apply(this, arguments);
		
		this.updateShape();
				
		this.on('add change:stereotype',function() { this.updateStereotypeLabel(); this.updateShape(); }, this);
		
		this.on('add change:essentialPart change:immutablePart change:immutableWhole change:inseparablePart', 
		function() { this.updateMetaAttributeLabels(); }, this);
    },	
});

/** OntoUML DataType */
joint.shapes.ontouml.DataType = joint.shapes.mcore.MDataType.extend({

    defaults: joint.util.deepSupplement({
        type: 'joint.shapes.ontouml.DataType',		
        stereotype: []
    }, joint.shapes.mcore.MDataType.prototype.defaults),
	
	getStereotypeName: function() {
        return this.get('stereotype');
    },
	
	getFullName: function() {
		if(this.get('stereotype').length > 0){
			return ["\u00AB"+this.get('stereotype')+"\u00BB",this.get('name')];
		}else{
			return this.get('name');
		}
    }
});

/** OntoUML Class */
joint.shapes.ontouml.Class = joint.shapes.mcore.MClass.extend({

    defaults: joint.util.deepSupplement({
        type: 'joint.shapes.ontouml.Class',		
        stereotype: []
    }, joint.shapes.mcore.MClass.prototype.defaults),
	
	getStereotypeName: function() {
        return this.get('stereotype');
    },
	
	getFullName: function() {
		if(this.get('stereotype').length > 0){
			return ["\u00AB"+this.get('stereotype')+"\u00BB",this.get('name')];
		}else{
			return this.get('name');
		}
    }	
});