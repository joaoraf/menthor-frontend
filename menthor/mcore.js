joint.shapes.mcore = {};

/** M-GeneralizationSet */
joint.shapes.mcore.MGeneralizationSet = joint.shapes.basic.Rect.extend({
	
	defaults: joint.util.deepSupplement({
        type: 'joint.shapes.mcore.MGeneralizationSet',
		position: { x: 50, y: 50 },
		size: { width: 125, height: 20 },
        attrs: { 						
			rect: { fill: 'white', 'stroke-width': 0}, text: { fill: 'black', 'font-family': 'Arial', 'font-size':12, text: '' }
		},
		name: 'gs',
		isDisjoint: true,
		isCovering: true,
		generalizations: [],
    }, joint.shapes.basic.Rect.prototype.defaults),
	
	setIsDisjoint: function(value){ this.set('isDisjoint',value) },	
	setIsCovering: function(value){ this.set('isCovering',value) },	
	isDisjoint: function(){ return this.get('isDisjoint'); },	
	isCovering: function(){ return this.get('isCovering'); },		
	setName: function(value) { this.set('name',value); },
	getName: function() { return this.get('name'); },
	
	getAttributesText: function(){
		var text = "";
		if(this.isDisjoint() && !this.isCovering()) text = "{disjoint}";
		if(!this.isDisjoint() && this.isCovering()) text = "{covering}";
		if(this.isDisjoint() && this.isCovering()) text = "{disjoint, covering}";
		if(!this.isDisjoint() && !this.isCovering()) text = "{}";
		return text;		
	},
	
	toString: function(){
		return this.getName()+" "+this.getAttributesText();
	},
	
 	setGeneralizations: function(canvas, gens){		
		_.each(gens, (function(g){
			if(!inArray(this.get('generalizations'), g)) this.get('generalizations').push(g);	
		}).bind(this));	
		this.updatePosition(canvas.getGraph());
	},
	
	initialize: function() {
        joint.shapes.basic.Rect.prototype.initialize.apply(this, arguments);
		this.on('add change:isCovering change:isDisjoint',function() { this.updateText(); }, this);	
	},
	
	getMiddleGeneralization: function(){
		if(this.get('generalizations')==null) return;
		var mid = Math.floor(this.get('generalizations').length/2);
		if(mid<0) mid=0;
		return this.get('generalizations')[mid];		
	},
		
	updatePosition: function(graph){
		this.toBack();
		var pointAnchor = midPoint(graph,this.getMiddleGeneralization());
		this.set('position', {x: pointAnchor.x, y: pointAnchor.y });				
	},
	
	updateText: function(){
		this.get('attrs').text.text = this.getAttributesText();		
	},
});

/** M-Generalization */
joint.shapes.mcore.MGeneralization = joint.shapes.uml.Generalization.extend({
	defaults: joint.util.deepSupplement({  
		type: 'joint.shapes.mcore.MGeneralization',
		attrs: { '.marker-target': { d: 'M 18 0 L 0 10 L 18 18 z', fill: 'white' }}		
	}, joint.shapes.uml.Association.prototype.defaults),
	
	initialize: function() {
        joint.shapes.uml.Generalization.prototype.initialize.apply(this, arguments);
    },
	
	getGeneral: function(){ return this.get('target') },
	getSpecific: function(){ return this.get('source') },
	
	toString: function(){
		return this.getSpecific().name+" -> "+this.getGeneral().name;
	},
});

/** M-Relationship */
joint.shapes.mcore.MRelationship = joint.shapes.uml.Association.extend({
    defaults: joint.util.deepSupplement({ 		
		type: 'joint.shapes.mcore.MRelationship',
		labels: [],
		name: [],
		sourceMultiplicity: "1",	
		targetMultiplicity: "1..*",
		sourceDependent:false,
		targetDependent:false,
		sourceOrdered:false,
		targetOrdered:false,
		sourceEndName: [],
		targetEndName: [],
	}, joint.shapes.uml.Association.prototype.defaults),
	
	setName: function(name){ this.set('name',name) }, 	
	getName: function(){ return this.get('name') }, 	
	getSourceMultiplicity: function(){ return this.get('sourceMultiplicity') },	
	getTargetMultiplicity: function(){ return this.get('targetMultiplicity') },	
	isSourceDependent: function(){ return this.get('sourceDependent') }, 	
	getSourceDependentLabelName: function(){ return "dependent" },	
	isTargetDependent: function(){ return this.get('targetDependent') }, 	
	getTargetDependentLabelName: function(){ return "dependent" },		
	isSourceOrdered: function(){ return this.get('sourceOrdered') }, 	
	getSourceOrderedLabelName: function(){ return "ordered" },	
	isTargetOrdered: function(){ return this.get('targetOrdered') }, 	
	getTargetOrderedLabelName: function(){ return "ordered" },	
	toOrthogonal: function(){ this.set('router', { name: 'orthogonal' }); },		
	toManhatan: function(){ this.set('router', { name: 'manhattan' }); },	
	toMetro: function(){ this.set('router', { name: 'metro' }); },
	
	getSourceFullLabelName: function(){
		if(this.getSourceMultiplicity()!=null){
			if(this.isSourceOrdered() && this.isSourceDependent()){
				return this.getSourceMultiplicity() + "\n{"+this.getSourceOrderedLabelName()+",\n"+this.getSourceDependentLabelName()+"}";				
			}else if(this.isSourceOrdered() && !this.isSourceDependent()){
				return this.getSourceMultiplicity() + "\n{"+this.getSourceOrderedLabelName()+"}"
			}else if(!this.isSourceOrdered() && this.isSourceDependent()){
				return this.getSourceMultiplicity() + "\n{"+this.getSourceDependentLabelName()+"}"
			}else if(!this.isSourceOrdered() && !this.isSourceDependent()){
				return this.getSourceMultiplicity()
			}
		}
	},
	
	getTargetFullLabelName: function(){
		if(this.getTargetMultiplicity()!=null){
			if(this.isTargetOrdered() && this.isTargetDependent()){
				return this.getTargetMultiplicity() + "\n{"+this.getTargetOrderedLabelName()+",\n"+this.getTargetDependentLabelName()+"}";				
			}else if(this.isTargetOrdered() && !this.isTargetDependent()){
				return this.getTargetMultiplicity() + "\n{"+this.getTargetOrderedLabelName()+"}"
			}else if(!this.isTargetOrdered() && this.isTargetDependent()){
				return this.getTargetMultiplicity() + "\n{"+this.getTargetDependentLabelName()+"}"
			}else if(!this.isTargetOrdered() && !this.isTargetDependent()){
				return this.getTargetMultiplicity()
			}
		}
	},
		
	initialize: function() {				
		joint.shapes.uml.Association.prototype.initialize.apply(this, arguments);	
		this.on('add change:sourceMultiplicity change:targetMultiplicity change:sourceOrdered change:sourceDependent change:targetDependent change:targetOrdered', 
		function() { this.updateCornerLabels(); }, this);		
		this.on('add change:name',function() { this.updateNameLabel(); }, this);			
    },				
	
	updateNameLabel: function(){
		this.label(0, {
            position: 0.5,
            attrs: {
                rect: { fill: 'white' }, text: { dy:-7.5, fill: 'black', 'font-family': 'Arial', 'font-size':12, text: this.getName() }
            },
        });				
	},
	
	updateCornerLabels: function(){	
		var offset = 0
		if(this.getSourceFullLabelName().length>5) offset = (this.getSourceFullLabelName().length+5)
		this.label(1, {
			position: -15-offset,
			attrs: {
				rect: { fill: 'white' }, text: { 'dy':-7.5, fill: 'black', 'font-family': 'Arial', 'font-size':12, text: this.getSourceFullLabelName() }
			}
		});	    	
		this.label(2, {
			position: 15+offset,
			attrs: {
				rect: { fill: 'white' }, text: { 'dy':-7.5, fill: 'black', 'font-family': 'Arial', 'font-size':12, text: this.getTargetFullLabelName() }
			}
		});		
	},
});

/** M-Type */
joint.shapes.mcore.MType = joint.shapes.uml.Class.extend({

    defaults: joint.util.deepSupplement({
        type: 'joint.shapes.mcore.MType',			
        size: { width: 95, height: 40 },
        attrs: {	
			magnet: true,
            '.uml-class-name-rect': { 'stroke-width': 2, 'fill': '#FFFFFF' },
			'.uml-class-attrs-rect': { 'stroke-width': 2, 'fill': '#FFFFFF' }, 		
			'.uml-class-methods-rect': { 'stroke-width': 2, 'fill': '#FFFFFF' },			
			'.uml-class-name-text': { 'font-size': 13, 'font-family': 'Arial', 'font-weight': 'plain' },
            '.uml-class-attrs-text': {'font-size': 13, 'font-family': 'Arial' },
            '.uml-class-methods-text': { 'font-size': 13, 'font-family': 'Arial' }
		},		
    }, joint.shapes.uml.Class.prototype.defaults),		
	
	getFullName: function(){ return this.getClassName(); },	
	getWidth: function(){ return this.get('size').width; },	
	getHeight: function(){ return this.get('size').height; },
	
	/** Max width of the texts inside the rectangles 
	  * i.e. max width between the name, stereotype, attributes and methods */
	getTextsMaxWidth: function(rects){
		var max = 0
	   _.each(rects, function(rect) {
			var lines = _.isArray(rect.text) ? rect.text : [rect.text];
			_.each(lines, function(line){		
				var width = line.length*7.5;	
				if(width> max) max = width;
			});
		});
		return max		
	},
	
	updateRectanglesWidth: function(rects){
		var attrs = this.get('attrs');
        var maxTextWidth = this.getTextsMaxWidth(rects);
		if(this.get('size').width < maxTextWidth) this.get('size').width = maxTextWidth;
		var width = this.get('size').width;
		_.each(rects, function(rect) {
		     attrs['.uml-class-' + rect.type + '-rect'].width = width;
		});	
	},
	
	updateRectanglesHeight: function(rects){
		var attrs = this.get('attrs');		
		var offsetY = 0;
        _.each(rects, function(rect) {
            var rectLines = _.isArray(rect.text) ? rect.text : [rect.text];			
			var rectHeight = rectLines.length+35;			
			if(rectLines.length==0){
				attrs['.uml-class-' + rect.type + '-rect'].display = 'none';
			}else{
				attrs['.uml-class-' + rect.type + '-text'].text = rectLines.join('\n');
				attrs['.uml-class-' + rect.type + '-rect'].height = rectHeight;
				attrs['.uml-class-' + rect.type + '-rect'].transform = 'translate(0,' + offsetY + ')';			
				offsetY += rectHeight;
			}
        });
		if(this.get('size').height < offsetY) this.get('size').height = offsetY;
	},
	
	updateRectangles: function() {        
        var rects = [
            { type: 'name', text: this.getFullName() },
            { type: 'attrs', text: this.get('attributes') },
            { type: 'methods', text: this.get('methods') }
        ];	
		this.updateRectanglesWidth(rects);
		this.updateRectanglesHeight(rects);			
    }	
});


/** M-Class */
joint.shapes.mcore.MClass = joint.shapes.mcore.MType.extend({
	type: 'joint.shapes.mcore.MClass',
});

/** M-DataType */
joint.shapes.mcore.MDataType = joint.shapes.mcore.MType.extend({
	type: 'joint.shapes.mcore.MDataType',
});