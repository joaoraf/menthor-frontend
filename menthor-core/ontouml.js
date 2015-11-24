joint.shapes.ontouml = {};

joint.shapes.ontouml.Canvas = joint.shapes.mcore.MCanvas.extend({

});

joint.shapes.ontouml.Generalization = joint.shapes.mcore.MGeneralization.extend({

});

joint.shapes.ontouml.Relationship = joint.shapes.mcore.MRelationship.extend({
	defaults: joint.util.deepSupplement({ 
		type: 'ontouml.Relationship',		
		stereotype: []
	}, joint.shapes.mcore.MRelationship.prototype.defaults),
	
	initialize: function() {
		joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
		if(this.getStereotypeName().toLowerCase()== 'componentof' || this.getStereotypeName().toLowerCase()== 'memberof'
		|| this.getStereotypeName().toLowerCase()== 'subcollectionof' || this.getStereotypeName().toLowerCase()== 'subquantityof'
		|| this.getStereotypeName().toLowerCase()== 'subeventof' || this.getStereotypeName().toLowerCase()== 'constitution'
		|| this.getStereotypeName().toLowerCase()== 'quapartof'){					
			this.attr('.marker-source', { d: 'M 20 8 L 10 0 L 0 8 L 10 16 z', fill: 'white'});			
		}
    },
	
	getStereotype: function() {
        return "\u00AB"+this.get('stereotype')+"\u00BB";
    },
	
	getStereotypeName: function() {
        return this.get('stereotype');
    },
});

joint.shapes.ontouml.Class = joint.shapes.mcore.MClass.extend({

    defaults: joint.util.deepSupplement({
        type: 'ontouml.Class',		
        stereotype: []
    }, joint.shapes.mcore.MClass.prototype.defaults),
	
	getStereotypeName: function() {
        return this.get('stereotype');
    },
	
	getClassName: function() {
		if(this.get('stereotype').length > 0){
			return ["\u00AB"+this.get('stereotype')+"\u00BB",this.get('name')];
		}else{
			return this.get('name');
		}
    }
});