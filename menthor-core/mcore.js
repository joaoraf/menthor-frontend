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
    defaults: joint.util.deepSupplement({ 
		type: 'mcore.MRelationship',
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
	
	setName: function(name){
		this.set('name',name)
	}, 
	
	getName: function(){
		return this.get('name')
	}, 
	
	getSourceMultiplicity: function(){
		return this.get('sourceMultiplicity')
	},
	
	getTargetMultiplicity: function(){
		return this.get('targetMultiplicity')
	},
	
	isSourceDependent: function(){
		return this.get('sourceDependent')
	}, 
	
	getSourceDependentLabelName: function(){
		return "dependent"
	},
	
	isTargetDependent: function(){
		return this.get('targetDependent')
	}, 
	
	getTargetDependentLabelName: function(){
		return "dependent"
	},
		
	isSourceOrdered: function(){
		return this.get('sourceOrdered')
	}, 
	
	getSourceOrderedLabelName: function(){
		return "ordered"
	},
	
	isTargetOrdered: function(){
		return this.get('targetOrdered')
	}, 
	
	getTargetOrderedLabelName: function(){
		return "ordered"
	},
	
	toOrthogonal: function(){
		this.set('router', { name: 'orthogonal' });			
	},	
	
	toManhatan: function(){
		this.set('router', { name: 'manhattan' });
	},
	
	toMetro: function(){
		this.set('router', { name: 'metro' });
	},
	
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
                rect: { fill: '#D3D3D3' }, text: { dy:10, fill: 'black', 'font-family': 'Arial', 'font-size':12, text: this.getName() }
            },
        });				
	},
	
	updateCornerLabels: function(){	
		this.label(1, {
			position: -15,
			attrs: {
				rect: { fill: '#D3D3D3' }, text: { dy:10, fill: 'black', 'font-family': 'Arial', 'font-size':12, text: this.getSourceFullLabelName() }
			}
		});	    	
		this.label(2, {
			position: 15,
			attrs: {
				rect: { fill: '#D3D3D3' }, text: { dy:10, fill: 'black', 'font-family': 'Arial', 'font-size':12, text: this.getTargetFullLabelName() }
			}
		});		
	},
});

/** MType */
joint.shapes.mcore.MType = joint.shapes.uml.Class.extend({

    defaults: joint.util.deepSupplement({
        type: 'mcore.MClass',			
        size: { width: 120, height: 70 },
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
	
	getFullName: function(){
		return this.getClassName();
	},
	
	updateRectangles: function() {
        var attrs = this.get('attrs');
        var rects = [
            { type: 'name', text: this.getFullName() },
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


/** MClass */
joint.shapes.mcore.MClass = joint.shapes.mcore.MType.extend({
	
});

/** MDataType */
joint.shapes.mcore.MDataType = joint.shapes.mcore.MType.extend({
	
});