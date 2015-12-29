
/** ===========================
  * MCore - Concrete Syntax
  *
  * A shape makes reference to an instance of an element in the language's abstract syntax.
  * The shape's attribute called 'content' is used to store that instance.
  * =========================== */

joint.shapes.mcore = {};

joint.shapes.mcore.MType = joint.shapes.basic.Generic.extend({

	markup: [
        '<g class="rotatable">',
          '<g class="scalable">',
            '<rect class="uml-class-name-rect"/><rect class="uml-class-attrs-rect"/>',
          '</g>',
          '<text class="uml-class-name-text"/><text class="uml-class-attrs-text"/>',
        '</g>'
    ].join(''),
		           	
    defaults: joint.util.deepSupplement({
        type: 'joint.shapes.mcore.MType',			
        size: { width: 95, height: 40 },
        attrs: {
            '.uml-class-name-rect': { 'stroke': 'black', 'stroke-width': 2, 'fill': '#FFFFFF' },
			'.uml-class-attrs-rect': { 'stroke': 'black', 'stroke-width': 2, 'fill': '#FFFFFF' },
			'.uml-class-name-text': { 'ref': '.uml-class-name-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle', 'font-weight': 'plain',  'fill': 'black', 'font-size': 13, 'font-family': 'Arial' },			
            '.uml-class-attrs-text': { 'ref': '.uml-class-attrs-rect', 'ref-y': 5, 'ref-x': 5, 'fill': 'black', 'font-size': 13, 'font-family': 'Arial' },			            
		},						
		content: new MType(), //reference to the abstract syntax
    }, joint.shapes.basic.Generic.prototype.defaults),		
	
	//getters to the abstract syntax values
	getName: function(){ return this.get('content').name; },	
	getAttributes: function(){ return this.get('content').attributes; },
	getUniqueName: function(){ return this.get('content').uniqueName; },
	getDefinitions: function(){ return this.get('content').definitions; },
	getSynonyms: function(){ return this.get('content').synonyms; },
	getText: function(){ return this.get('content').text; },
	isAbstract: function(){ return this.get('content').isAbstract; },
	
	displayName: function(){ return this.get('content').name; },
	addAttribute: function(attr) { this.get('content').attributes.push(attr); },
	attributeText: function(attr) {
		return attr.name + ": "+attr.stereotype+" ["+attr.multiplicity+"]" 
	},
	attributesText: function() {
		var result = []
		_.each(this.getAttributes(), (function(attr){ result.push(this.attributeText(attr)); }).bind(this));
		return result;
	},
			
	initialize: function(){		
		joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);				
		this.updateRectangles();
    },
	
	getWidth: function(){ return this.get('size').width; },	
	getHeight: function(){ return this.get('size').height; },	
	
	updateViewOn: function(paper){
		var cellView = this.findView(paper);
		if(cellView!=null){
			this.updateRectangles(); 
			cellView.update(); 
			cellView.resize();
		}
	},
	
	updateRectangles: function() {        
        var rects = [
            { type: 'name', text: this.displayName() },
            { type: 'attrs', text: this.attributesText() },            
        ];	
		this.updateRectanglesWidth(rects);
		this.updateRectanglesHeight(rects);			
    },
	
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
});

joint.shapes.mcore.MClass = joint.shapes.mcore.MType.extend({
	
	defaults: joint.util.deepSupplement({
        type: 'joint.shapes.mcore.MClass',
		content: new MClass(), //reference to the abstract syntax
    }, joint.shapes.mcore.MType.prototype.defaults),		
	
	initialize: function(){        
        joint.shapes.mcore.MType.prototype.initialize.apply(this, arguments);		
    },	
});

joint.shapes.mcore.MDataType = joint.shapes.mcore.MType.extend({
	
	defaults: joint.util.deepSupplement({
        type: 'joint.shapes.mcore.MDataType',
		content: new MDataType(), //reference to the abstract syntax
    }, joint.shapes.mcore.MType.prototype.defaults),
	
	displayName: function(){
		return ["\u00AB"+"dataType"+"\u00BB",this.getName()];
	},
	
	initialize: function(){        
        joint.shapes.mcore.MType.prototype.initialize.apply(this, arguments);	
    },
});

joint.shapes.mcore.MGeneralizationSet = joint.shapes.basic.Rect.extend({
	
	defaults: joint.util.deepSupplement({
        type: 'joint.shapes.mcore.MGeneralizationSet',
		position: { x: 50, y: 50 },
		size: { width: 125, height: 20 },
        attrs: { 						
			rect: { fill: 'white', 'stroke-width': 0}, text: { fill: 'black', 'font-family': 'Arial', 'font-size':12, text: '' }
		},
		content: new MGeneralizationSet(), //reference to the abstract syntax
    }, joint.shapes.basic.Rect.prototype.defaults),
	
	//getters to the abstract syntax values
	isDisjoint: function(){ return this.get('content').disjoint; },			
	isComplete: function(){ return this.get('content').complete; },			
	getName: function() { return this.get('content').name; },
	
	metaAttributesText: function(){
		var text = '';
		if(this.isDisjoint() && !this.isComplete()) text = "{disjoint}";
		if(!this.isDisjoint() && this.isComplete()) text = "{complete'}";
		if(this.isDisjoint() && this.isComplete()) text = "{disjoint, complete}";
		if(!this.isDisjoint() && !this.isComplete()) text = "{}";
		if(this.getName()!=null && this.getName()!='') text = this.getName()+" "+text;
		return text;		
	},
	
	updateText: function(){ 
		this.get('attrs').text.text = this.metaAttributesText(); 
	},
	
	setDefaultSize: function(){
		this.set('size', { width: 125, height: 20 });
	},
	
	initialize: function() {
        joint.shapes.basic.Rect.prototype.initialize.apply(this, arguments);	
		this.updateText();
		this.setDefaultSize();
	},
	
	updateViewOn: function(paper){
		var cellView = this.findView(paper);
		if(cellView!=null){	
			this.updateText();
			this.setDefaultSize();
			cellView.update(); 
		}
	},
});
  
joint.shapes.mcore.MGeneralization = joint.dia.Link.extend({
	
	defaults: joint.util.deepSupplement({  
		type: 'joint.shapes.mcore.MGeneralization',
		attrs: { '.marker-target': { d: 'M 18 0 L 0 10 L 18 18 z', fill: 'white' }},
		content: new MGeneralization(), //reference to the abstract syntax
		gslink: [], 	
	}, joint.dia.Link.prototype.defaults),
	
	initialize: function() {
        joint.dia.Link.prototype.initialize.apply(this, arguments);
    },
	
	//getters to the abstract syntax values
	getGeneral: function(){ return this.get('content').general },
	getSpecific: function(){ return this.get('content').specific },
	getGeneralizationSet: function() { return this.get('content').generalzationSet },
	
	getGeneralizationSetShape: function(){ return this.get('gslink').get('target') },	
	getGeneralShape: function(){ return this.get('target') },
	getSpecificShape: function(){ return this.get('source') },	
	
	updateViewOn: function(paper){
		var cellView = this.findView(paper);
		if(cellView!=null){			
			cellView.update(); 
		}
	},
});
  
joint.shapes.mcore.MRelationship = joint.dia.Link.extend({
	
    defaults: joint.util.deepSupplement({ 		
		type: 'joint.shapes.mcore.MRelationship',	
		content: new MRelationship(), //reference to the abstract syntax
	}, joint.dia.Link.prototype.defaults),
	
	initialize: function() {				
		joint.dia.Link.prototype.initialize.apply(this, arguments);	
		this.installCornerLabels();
		this.installCenterLabel();
    },
	
	updateViewOn: function(paper){
		var cellView = this.findView(paper);
		if(cellView!=null){		
			this.installCornerLabels();
			this.installCenterLabel();
			cellView.update(); 
		}
	},
		
	//getters to the abstract syntax values
	getName: function(){ return this.get('content').name }, 	
	getSourceMultiplicity: function(){ return this.get('content').endPoints[0].multiplicity },	
	getTargetMultiplicity: function(){ return this.get('content').endPoints[1].multiplicity },	
	isSourceDependent: function(){ return this.get('content').endPoints[0].dependency }, 		
	isTargetDependent: function(){ return this.get('content').endPoints[1].dependency }, 		
	isSourceOrdered: function(){ return this.get('content').endPoints[0].ordered }, 		
	isTargetOrdered: function(){ return this.get('content').endPoints[1].ordered }, 	
		
	getSourceShape: function() { return this.get('source'); },
	getTargetShape: function() { return this.get('target'); },
	toOrthogonal: function(){ this.set('router', { name: 'orthogonal' }); },		
	toManhatan: function(){ this.set('router', { name: 'manhattan' }); },	
	toMetro: function(){ this.set('router', { name: 'metro' }); },
		
	getSourceDependentLabelName: function(){ return "dependent" },	
	getTargetDependentLabelName: function(){ return "dependent" },		
	getSourceOrderedLabelName: function(){ return "ordered" },	
	getTargetOrderedLabelName: function(){ return "ordered" },	
		
	displayName: function(){
		return this.getName();
	},
	
	srcLabelDisplayName: function(){
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
	
	tgtLabelDisplayName: function(){
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
	
	installCenterLabel: function(){
		this.label(0, {
            position: 0.5,
            attrs: {
                rect: { fill: 'white' }, text: { fill: 'black', 'font-family': 'Arial', 'font-size':12, dy:-15, text: this.displayName() }
            },
        });			
	},
	
	installSourceLabel: function(){
		var offsetSrc = 0
		if(this.srcLabelDisplayName().length>5) offsetSrc = (this.srcLabelDisplayName().length+5)
		this.label(1, {
			position: -15-offsetSrc,
			attrs: {
				rect: { fill: 'white' }, text: { fill: 'black', 'font-family': 'Arial', 'font-size':12, dy:-15, text: this.srcLabelDisplayName() }
			}
		});	
	},
	
	installTargetLabel: function(){
		var offsetTgt = 0
		if(this.tgtLabelDisplayName().length>5) offsetTgt = (this.tgtLabelDisplayName().length+5)
		this.label(2, {
			position: 15+offsetTgt,
			attrs: {
				rect: { fill: 'white' }, text: { fill: 'black', 'font-family': 'Arial', 'font-size':12, dy:-15, text: this.tgtLabelDisplayName() }
			}
		});	
	},
	
	installCornerLabels: function(){	
		this.installSourceLabel();
		this.installTargetLabel();
	},	
});