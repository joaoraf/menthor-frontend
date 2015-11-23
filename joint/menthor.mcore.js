joint.shapes.mcore = {};

joint.shapes.mcore.MClass = joint.shapes.uml.Class.extend({

    defaults: joint.util.deepSupplement({
        type: 'mcore.MClass',			
        size: { width: 120, height: 70 },
        attrs: {					
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
        var offsetY = 0;
		var offsetX = 0;
        _.each(rects, function(rect) {
            var lines = _.isArray(rect.text) ? rect.text : [rect.text];
            var rectHeight = lines.length * 20 + 20;
			var rectWidth = lines.join('\n').length+50;
			if(rectWidth> offsetX) offsetX = rectWidth;
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
		     attrs['.uml-class-' + rect.type + '-rect'].width = offsetX;
		});				
		this.get('size').width = offsetY;
		this.get('size').height = offsetX;
    }	
});