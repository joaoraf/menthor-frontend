/** ===========================
  * OntoUML - Concrete Syntax
  *
  * A shape makes reference to an instance of an element in the language's abstract syntax.
  * The shape's attribute called 'content' is used to store that instance.
  * =========================== */
  
joint.shapes.ontouml = {};

joint.shapes.ontouml.DataType = joint.shapes.mcore.MDataType.extend({

    defaults: joint.util.deepSupplement({
        type: 'joint.shapes.ontouml.DataType',		
		content: new OntoUMLDataType(),
    }, joint.shapes.mcore.MDataType.prototype.defaults),
	
	stereotypeName: function() { return this.get('content').stereotype; },	
	displayName: function() {
		if(this.get('content').stereotype !=null && this.get('content').stereotype.length > 0){
			return ["\u00AB"+this.get('content').stereotype+"\u00BB",this.get('content').name];
		}else{
			return ["\u00AB"+"dataType"+"\u00BB",this.get('content').name]
		}
    }
});

joint.shapes.ontouml.Class = joint.shapes.mcore.MClass.extend({

    defaults: joint.util.deepSupplement({
        type: 'joint.shapes.ontouml.Class',		
		content: new OntoUMLClass,
    }, joint.shapes.mcore.MClass.prototype.defaults),
		
	stereotypeName: function() { return this.get('content').stereotype; },	
	displayName: function() {
		if(this.get('content').stereotype !=null && this.get('content').stereotype.length > 0){
			return ["\u00AB"+this.get('content').stereotype+"\u00BB",this.get('content').name];
		}else{
			return this.get('content').name;
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
		content: new OntoUMLRelationship(), //reference to the abstract syntax
	}, joint.shapes.mcore.MRelationship.prototype.defaults),
		
	getStereotypeName: function() { return String(this.get('content').stereotype); },	
	isShareable: function() { return this.get('content').shareable; },	
	isPartEssential: function() { return this.get('content').essentialPart; },	
	isWholeImmutable: function() { return this.get('content').immutableWhole; },	
	isPartInseparable: function() { return this.get('content').inseparablePart; },
	isPartImmutable: function() { return this.get('content').immutablePart; },		
	getStereotype: function() {
		if(this.get('content').stereotype!=null && this.get('content').stereotype!="") return "\u00AB"+this.get('content').stereotype+"\u00BB"; 
		else return "";
    },	
		
	initialize: function() {		
		joint.shapes.mcore.MRelationship.prototype.initialize.apply(this, arguments);		
		this.updateShape();				
		this.installMetaAttributeLabels();
		this.installStereotypeLabel();		
    },	
			
	metaAttrsLabelDisplayName: function(){
		if(this.isPartEssential() && this.isWholeImmutable()) return "{essentialPart, immutableWhole}"
		if(this.isPartEssential() && this.isPartInseparable()) return "{essentialPart, inseparablePart}"
		if(this.isPartEssential()) return "{essentialPart}"
		if(this.isPartImmutable() && this.isWholeImmutable()) return "{immutablePart, immutableWhole}"
		if(this.isPartImmutable() && this.isPartInseparable()) return "{immutablePart, inseparablePart}"
		if(this.isPartImmutable()) return "{immutablePart}"
		if(this.isWholeImmutable()) return "{immutableWhole}"
		if(this.isPartInseparable()) return "{inseparablePart}"
		return ''
	},
	
	installStereotypeLabel: function(){					
		var txt = this.getStereotype();
		if(this.getStereotypeName()=='derivation') txt = ""
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
			this.attr('.marker-vertices', { display : 'none' });
            this.attr('.marker-arrowheads', { display: 'none' });
            this.attr('.connection-wrap', { display: 'none' });
            this.attr('.link-tools', { display : 'none' });			
			this.toBack();
		} 	
	},
});
