joint.shapes.mcore = {};

joint.shapes.mcore.MCanvas = joint.dia.Paper.extend({
	defaults: {
		perpendicularLinks: true,
	},
});

joint.shapes.mcore.MGeneralization = joint.dia.Link.extend({
	defaults: { 
		type: 'mcore.MGeneralization',
		attrs: { '.marker-target': { d: 'M 18 0 L 0 10 L 18 18 z', fill: 'white' }}		
	},
	
	initialize: function() {
        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
    },
});

joint.shapes.mcore.MRelationship = joint.dia.Link.extend({
    defaults: { 
		type: 'mcore.MRelationship' 
	},
	
	initialize: function() {
		//this.set('router', { name: 'orthogonal' });
        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
    },
});

joint.shapes.mcore.MClass = joint.shapes.uml.Class.extend({

    defaults: joint.util.deepSupplement({
        type: 'mcore.MClass',			
        size: { width: 120, height: 70 },
        attrs: {	
			magnet: true,
            '.uml-class-name-rect': { 'stroke-width': 2, 'fill': '#FFFFFF' },
			'.uml-class-attrs-rect': { 'stroke-width': 2, 'fill': '#FFFFFF' }, 		
			'.uml-class-methods-rect': { 'stroke-width': 2, 'fill': '#FFFFFF' },			
			'.uml-class-name-text': { 'font-size': 13, 'font-family': 'RobotoDraft, sans-serif;', 'font-weight': 'bold' },
            '.uml-class-attrs-text': {'font-size': 13, 'font-family': 'RobotoDraft, sans-serif;' },
            '.uml-class-methods-text': { 'font-size': 13, 'font-family': 'RobotoDraft, sans-serif;' }
		},		
    }, joint.shapes.uml.Class.prototype.defaults),		
	
	
	updateRectangles: function() {
        var attrs = this.get('attrs');
        var rects = [
            { type: 'name', text: this.getClassName() },
            { type: 'attrs', text: this.get('attributes') },
            { type: 'methods', text: this.get('methods') }
        ];
        var maxWidth = 0;
		var offsetY = 0;
        _.each(rects, function(rect) {
            var lines = _.isArray(rect.text) ? rect.text : [rect.text];
			_.each(lines, function(line){
				var rectWidth = line.length*8+20;	
				if(rectWidth> maxWidth) maxWidth = rectWidth;
			});
			var rectHeight = lines.length+35;			
			if(lines.length==0){
				attrs['.uml-class-' + rect.type + '-rect'].display = 'none';
			}else{
				attrs['.uml-class-' + rect.type + '-text'].text = lines.join('\n');
				attrs['.uml-class-' + rect.type + '-rect'].height = rectHeight;
				attrs['.uml-class-' + rect.type + '-rect'].transform = 'translate(0,' + offsetY + ')';			
				offsetY += rectHeight;
			}
        });		
		_.each(rects, function(rect) {
		     attrs['.uml-class-' + rect.type + '-rect'].width = maxWidth;
		});				
		this.get('size').width = maxWidth;
		this.get('size').height = offsetY;
    }	
});