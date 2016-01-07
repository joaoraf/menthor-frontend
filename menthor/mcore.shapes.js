
/** ===========================
  * MCore 1.0 - Concrete Syntax (Shapes)
  *
  * A shape makes reference to a model instance 
  * which stores the all the data about the element.
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
		content: new MType(),
    }, joint.shapes.basic.Generic.prototype.defaults),		
	
	getContent: function(){ return this.get('content'); },
	getWidth: function(){ return this.get('size').width; },	
	getHeight: function(){ return this.get('size').height; },	
	
	displayName: function(){ return this.getContent().name; },
	
	attrText: function(attr) { return attr.name + ": "+attr.stereotype+" ["+attr.multiplicity+"]" },
	
	attributesText: function() {
		var result = []
		_.each(this.getContent().attributes, (function(attr){
			result.push(this.attrText(attr)); 
		}).bind(this));
		return result;
	},
			
	initialize: function(){		
		joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);				
		this.updateRectangles();
    },
		
	cloneShape: function(graph){
		var newshape = graph.getCell(this.get("id")).clone();
		var newcontent = jQuery.extend(true, {}, this.get('content'));
		newshape.set('content',newcontent);
		return newshape;
	},
	
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
	
	/** Max width of the texts inside each rectangle 
	  * i.e. max width between name, stereotype, attributes and methods */
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
		content: new MClass(), 
    }, joint.shapes.mcore.MType.prototype.defaults),
	
	initialize: function(){        
        joint.shapes.mcore.MType.prototype.initialize.apply(this, arguments);		
    },	
});

joint.shapes.mcore.MDataType = joint.shapes.mcore.MType.extend({
	
	defaults: joint.util.deepSupplement({
        type: 'joint.shapes.mcore.MDataType',
		content: new MDataType(), 
    }, joint.shapes.mcore.MType.prototype.defaults),
	
	initialize: function(){        
        joint.shapes.mcore.MType.prototype.initialize.apply(this, arguments);	
    },	
	
	displayName: function(){		
		if(this.getContent().stereotype !=null && this.getContent().stereotype.length > 0){
			return ["\u00AB"+this.getContent().stereotype+"\u00BB",this.getContent().name];
		}else{
			return ["\u00AB"+"dataType"+"\u00BB",this.getContent().name]
		}
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
		content: new MGeneralizationSet(),
    }, joint.shapes.basic.Rect.prototype.defaults),
	
	getContent: function(){ return this.get('content'); },
				
	metaAttributesText: function(){
		var text = '';
		var isDijoint = this.getContent().disjoint;
		var isComplete = this.getContent().complete;
		var name = this.getContent().name;
		if(isDijoint  && !isComplete) text = "{disjoint}";
		if(!isDijoint &&  isComplete) text = "{complete'}";
		if(isDijoint  &&  isComplete) text = "{disjoint, complete}";
		if(!isDijoint && !isComplete) text = "{}";
		if(name!=null && name!='') text = name+" "+text;
		return text;		
	},
	
	updateText: function(){ this.get('attrs').text.text = this.metaAttributesText(); },
	
	setDefaultSize: function(){ this.set('size', { width: 125, height: 20 }); },
	
	initialize: function() {
        joint.shapes.basic.Rect.prototype.initialize.apply(this, arguments);	
		this.updateText();
		this.setDefaultSize();
	},
	
	cloneShape: function(graph){
		var newshape = graph.getCell(this.get("id")).clone();
		var newcontent = jQuery.extend(true, {}, this.get('content'));
		newshape.set('content',newcontent);
		return newshape;
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
	
	getGeneralizationSetShape: function(){ return this.get('gslink').get('target') },	
	getGeneralShape: function(){ return this.get('target') },
	getSpecificShape: function(){ return this.get('source') },	
	
	getGSLink: function(){ return this.get('gslink'); },
	
	/** create dashed link to a generalization set */
	createGSLink: function(paper, graph){
		var genView = this.findView(paper);
		if(this.get('gslink')!= null && !_.isEmpty(this.get('gslink'))) graph.getCell(this.get('gslink').id).remove();
		this.set('gslink', new joint.dia.Link({ source: midPoint(genView) }));		
		this.get('gslink').attr('.marker-vertices', { display : 'none' });
        this.get('gslink').attr('.marker-arrowheads', { display: 'none' });
        this.get('gslink').attr('.connection-wrap', { display: 'none' });
        this.get('gslink').attr('.link-tools', { display : 'none' });
		this.get('gslink').attr('.connection', { 'stroke-dasharray': '5,5' });	
		return this.get('gslink');
	},	
		
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
		
	getContent: function() { return this.get('content'); },
		
	getSourceShape: function() { return this.get('source'); },
	getTargetShape: function() { return this.get('target'); },
		
	displayName: function(){ return this.getContent().name; },
	
	srcLabelDisplayName: function(){
		var sourceMultiplicity = this.getContent().endPoints[0].multiplicity;
		var sourceDependency = this.get('content').endPoints[0].dependency;
		var sourceOrdered = this.get('content').endPoints[0].ordered;
		var orderedLabel = "ordered";
		var dependencyLabel = "dependent";
		if(sourceMultiplicity==null) return null
		if( sourceOrdered &&  sourceDependency) return sourceMultiplicity + "\n{"+orderedLabel+",\n"+dependencyLabel+"}";				
		if( sourceOrdered && !sourceDependency) return sourceMultiplicity + "\n{"+orderedLabel+"}";
		if(!sourceOrdered &&  sourceDependency) return sourceMultiplicity + "\n{"+dependencyLabel+"}";
		if(!sourceOrdered && !sourceDependency) return sourceMultiplicity
	},
	
	tgtLabelDisplayName: function(){
		var targetMultiplicity = this.getContent().endPoints[1].multiplicity;
		var targetDependency = this.get('content').endPoints[1].dependency;
		var targetOrdered = this.get('content').endPoints[1].ordered;
		var orderedLabel = "ordered";
		var dependencyLabel = "dependent";
		if(targetMultiplicity==null) return null;
		if( targetOrdered &&  targetDependency) return targetMultiplicity + "\n{"+orderedLabel+",\n"+dependencyLabel+"}";				
		if( targetOrdered && !targetDependency) return targetMultiplicity + "\n{"+orderedLabel+"}";
		if(!targetOrdered &&  targetDependency) return targetMultiplicity + "\n{"+dependencyLabel+"}";
		if(!targetOrdered && !targetDependency) return targetMultiplicity
	},
	
	installCenterLabel: function(){
		this.label(0, {
            position: 0.5,
            attrs: {
                rect: { fill: 'white' }, text: { fill: 'black', 'font-family': 'Arial', 'font-size':12, dy:-15, text: this.displayName() }
            },
        });			
	},
	
	installCornerLabels: function(){	
		this.installSourceLabel();
		this.installTargetLabel();
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
});