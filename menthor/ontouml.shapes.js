/** ===========================
  * OntoUML 2.0 - Concrete Syntax (Shapes)
  *
  * A shape makes reference to a model instance 
  * which stores the all the data about the element.
  * =========================== */
  
joint.shapes.ontouml = {};

joint.shapes.ontouml.DataType = joint.shapes.mcore.MDataType.extend({

    defaults: joint.util.deepSupplement({
        type: 'joint.shapes.ontouml.DataType',		
		content: new OntoUMLDataType(),
    }, joint.shapes.mcore.MDataType.prototype.defaults),	
});

joint.shapes.ontouml.Class = joint.shapes.mcore.MClass.extend({

    defaults: joint.util.deepSupplement({
        type: 'joint.shapes.ontouml.Class',		
		content: new OntoUMLClass,
    }, joint.shapes.mcore.MClass.prototype.defaults),
	
	displayName: function() {
		if(this.getContent().stereotype !=null && this.getContent().stereotype.length > 0){
			return ["\u00AB"+this.getContent().stereotype+"\u00BB",this.getContent().name];
		}else{
			return this.getContent().name;
		}
    }	
});

joint.shapes.ontouml.GeneralizationSet = joint.shapes.mcore.MGeneralizationSet.extend({
	type: 'joint.shapes.ontouml.GeneralizationSet',	
});

joint.shapes.ontouml.Generalization = joint.shapes.mcore.MGeneralization.extend({
	type: 'joint.shapes.ontouml.Generalization',	
});

joint.shapes.ontouml.Relationship = joint.shapes.mcore.MRelationship.extend({
	
	defaults: joint.util.deepSupplement({ 
		type: 'joint.shapes.ontouml.Relationship',				
		derivation: [],
		content: new OntoUMLRelationship(), 
	}, joint.shapes.mcore.MRelationship.prototype.defaults),
		
	getDerivation: function(){ return this.get('derivation'); },
		
	getStereotype: function() {
		if(this.getContent().stereotype!=null && this.getContent().stereotype!="") return "\u00AB"+this.getContent().stereotype+"\u00BB"; 
		else return "";
    },
		
	createDerivationLink: function(paper, graph){
		var materialView = this.findView(paper);			
		var rel = new OntoUMLRelationship()
		rel.stereotype = RelationshipStereotype.DERIVATION.stereotype;
		var derivationLink = new joint.shapes.ontouml.Relationship({ source: midPoint(materialView), content: rel });		
		this.set('derivation', derivationLink);
		return derivationLink;
	},
	
	initialize: function() {		
		joint.shapes.mcore.MRelationship.prototype.initialize.apply(this, arguments);		
		this.updateShape();				
		this.installMetaAttributeLabels();
		this.installStereotypeLabel();		
    },	
		
	metaAttrsLabelDisplayName: function(){
		var isPartEssential = this.getContent().essentialPart;
		var isWholeImmutable = this.getContent().immutableWhole;
		var isPartInseparable = this.getContent().inseparablePart;
		var isPartImmutable = this.getContent().immutablePart;
		if(isPartEssential && isWholeImmutable) return "{essentialPart, immutableWhole}"
		if(isPartEssential && isPartInseparable) return "{essentialPart, inseparablePart}"
		if(isPartEssential) return "{essentialPart}"
		if(isPartImmutable && isWholeImmutable) return "{immutablePart, immutableWhole}"
		if(isPartImmutable && isPartInseparable) return "{immutablePart, inseparablePart}"
		if(isPartImmutable) return "{immutablePart}"
		if(isWholeImmutable) return "{immutableWhole}"
		if(isPartInseparable) return "{inseparablePart}"
		return ''
	},
	
	installStereotypeLabel: function(){					
		var txt = this.getStereotype();		
		this.label(3, {
			position: 0.5,
			attrs: {
				rect: { fill: 'white' }, text: { fill: 'black', 'font-family': 'Arial', 'font-size':12, dy: 15, text: txt }
			},
		});				
	},
	
	installMetaAttributeLabels: function(){		
		this.label(4, {
            position: 0.5,
            attrs: {
                rect: { fill: 'white' }, text: { fill: 'black', 'font-family': 'Arial', 'font-size':12, dy: 30, text: this.metaAttrsLabelDisplayName() }
            },
        });	
	},
	
	updateShape: function(){
		if(this.getContent().stereotype === RelationshipStereotype.COMPONENTOF.stereotype || 
		   this.getContent().stereotype === RelationshipStereotype.MEMBEROF.stereotype ||
		   this.getContent().stereotype === RelationshipStereotype.SUBCOLLECTIONOF.stereotype || 
		   this.getContent().stereotype === RelationshipStereotype.SUBQUANTITYOF.stereotype ||
		   this.getContent().stereotype === RelationshipStereotype.SUBEVENTOF.stereotype || 
		   this.getContent().stereotype === RelationshipStereotype.CONSTITUTION.stereotype ||
		   this.getContent().stereotype === RelationshipStereotype.QUAPARTOF.stereotype
		){	
			var color = 'white'
			if(!this.getContent().shareable) color = 'black'
			this.attr('.marker-source', { d: 'M 20 8 L 10 0 L 0 8 L 10 16 z', fill: color});			
		}				
		if(this.getContent().stereotype === RelationshipStereotype.DERIVATION.stereotype){				
			this.attr('.connection', { 'stroke-dasharray': '5,5' });		
			this.attr('.marker-target', { d: 'M-5,0a5,5 0 1,0 10,0a5,5 0 1,0 -10,0', fill: color});
			this.attr('.marker-vertices', { display : 'none' });
            this.attr('.marker-arrowheads', { display: 'none' });
            this.attr('.connection-wrap', { display: 'none' });
            this.attr('.link-tools', { display : 'none' });			
			this.toBack();			
		} 	
	},
});
