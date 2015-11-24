joint.shapes.mcore = {};

/** MCanvas */
joint.shapes.mcore.MCanvas = joint.dia.Paper.extend({
	defaults: {
		
	},	
});

/** MGeneralization */
joint.shapes.mcore.MGeneralization = joint.shapes.uml.Generalization.extend({
	defaults: joint.util.deepSupplement({  
		type: 'mcore.MGeneralization',
		attrs: { '.marker-target': { d: 'M 18 0 L 0 10 L 18 18 z', fill: 'white' }}		
	}, joint.shapes.uml.Association.prototype.defaults),
	
	initialize: function() {
        joint.shapes.uml.Generalization.prototype.initialize.apply(this, arguments);
    },
});

/** MRelationship */
joint.shapes.mcore.MRelationship = joint.shapes.uml.Association.extend({
    defaults: { joint.util.deepSupplement({ 
		type: 'mcore.MRelationship',
		labels: [
			{ position: 0.1, attrs: { rect: { fill: 'white' }, text: { fill: 'black' }}},
			{ position: 0.9, attrs: { rect: { fill: 'white' }, text: { fill: 'black' }}},
			{ position: 0.5, attrs: { rect: { fill: 'white' }, text: { fill: 'black' }}}
		],
		name: [],
		sourceCardinality: "1",		
		targetCardinality: "1..*",		
		sourceDependency:false,
		targetDependency:false,
		sourceOrdered:false,
		targetOrdered:false,
		sourceEndName: [],
		targetEndName: [],
	}, joint.shapes.uml.Association.prototype.defaults),
	
	initialize: function() {
		alert("Not entering here!");
		this.set('router', { name: 'orthogonal' });			
		setSourceOrdered(true);
        joint.shapes.uml.Association.prototype.initialize.apply(this, arguments);
    },		
	
	setName: function(name){
		this.name = name
	}, 
	
	getName: function(){
		return this.name
	}, 
	
	isSourceDependent: function(){
		return this.sourceDependency
	}, 
	
	isTargetDependent: function(){
		return this.targetDependency
	}, 
	
	isSourceOrdered: function(){
		return this.sourceOrdered
	}, 
	
	isTargetOrdered: function(){
		return this.targetOrdered
	}, 
	
	setSourceOrdered: function(value){
		this.ordered = value
		if(value){
			var array = this.get('labels');
			array[0].text = this.sourceCardinality + " \n{ordered}";
		}else{
			array[0].text = this.sourceCardinality;
		}
	},
	
	setSourceDependent: function(value){
		this.dependency = value
		if(value){
			var array = this.get('labels');
			array[0].text = this.sourceCardinality + " \n{dependent}";
		}else{
			array[0].text = this.sourceCardinality;
		}
	},
	
	setTargetDependent: function(value){
		this.dependency = value
		if(value){
			var array = this.get('labels');
			array[1].text = this.targetCardinality + " \n{dependent}";
		}else{
			array[1].text = this.targetCardinality;
		}
	},
	
	setTargetOrdered: function(value){
		this.ordered = value
		if(value){
			var array = this.get('labels');
			array[1].text = this.targetCardinality + " \n{ordered}";
		}else{
			array[1].text = this.targetCardinality;
		}
	},
		
});

/** MClass */
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