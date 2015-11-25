joint.shapes.ontouml = {};

/** OntoUML Canvas */
joint.shapes.ontouml.Canvas = joint.shapes.mcore.MCanvas.extend({

});

/** OntoUML Generalization */
joint.shapes.ontouml.Generalization = joint.shapes.mcore.MGeneralization.extend({

});

/** OntoUML Relationship */
joint.shapes.ontouml.Relationship = joint.shapes.mcore.MRelationship.extend({
	defaults: joint.util.deepSupplement({ 
		type: 'ontouml.Relationship',		
		stereotype: [],
		essentialPart: false,
		immutablePart: false,
		immutableWhole: false,
		inseparablePart: false,
		shareable: false,
	}, joint.shapes.mcore.MRelationship.prototype.defaults),
		
	getStereotype: function() {
        return "\u00AB"+this.get('stereotype')+"\u00BB";
    },
	
	getStereotypeName: function() {
        return this.get('stereotype');
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
		this.label(3, {
            position: 0.5,
            attrs: {
                rect: { fill: '#D3D3D3' }, text: { fill: 'black', 'font-family': 'Arial', 'font-size':12, text: this.getStereotype() }
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
                rect: { fill: '#D3D3D3' }, text: { fill: 'black', 'font-family': 'Arial', 'font-size':12, text: this.getMetaAttributesLabelName() }
            },
        });	
	},
	
	initialize: function() {
		
		joint.shapes.mcore.MRelationship.prototype.initialize.apply(this, arguments);
		
		if(this.getStereotypeName().toLowerCase()== 'componentof' || this.getStereotypeName().toLowerCase()== 'memberof'
		|| this.getStereotypeName().toLowerCase()== 'subcollectionof' || this.getStereotypeName().toLowerCase()== 'subquantityof'
		|| this.getStereotypeName().toLowerCase()== 'subeventof' || this.getStereotypeName().toLowerCase()== 'constitution'
		|| this.getStereotypeName().toLowerCase()== 'quapartof'){	
			var color = 'white'
			if(!this.isShareable()) color = 'black'
			this.attr('.marker-source', { d: 'M 20 8 L 10 0 L 0 8 L 10 16 z', fill: color});			
		}
		
		this.on('add change:stereotype',function() { this.updateStereotypeLabel(); }, this);
		
		this.on('add change:essentialPart change:immutablePart change:immutableWhole change:inseparablePart', 
		function() { this.updateMetaAttributeLabels(); }, this);
    },
	
});

/** OntoUML DataType */
joint.shapes.ontouml.DataType = joint.shapes.mcore.MDataType.extend({

    defaults: joint.util.deepSupplement({
        type: 'ontouml.DataType',		
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
        type: 'ontouml.Class',		
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