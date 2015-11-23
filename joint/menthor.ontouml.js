joint.shapes.ontouml = {};

joint.shapes.ontouml.Class = joint.shapes.mcore.MClass.extend({

    defaults: joint.util.deepSupplement({
        type: 'ontouml.Class',		
        stereotype: []
    }, joint.shapes.mcore.MClass.prototype.defaults),
	
	getStereotype: function() {
        return "\u00AB"+this.get('stereotype')+"\u00BB";
    },
	
	getStereotypeName: function() {
        return this.get('stereotype');
    },
	
	getClassName: function() {
        return [this.getStereotype(),this.get('name')];
    }
});