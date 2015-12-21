
function Canvas(){
	
	/** each canvas points to a joint graph */	
	this.graph = new joint.dia.Graph();
	
	/** html element identifier */
	this.$id = null;	
	
	/** each canvas is composed of a joint paper */
	this.paper = null;

	/** each canvas has its own set of editing features */
	this.editor = new Editor();
		
	/** setup this canvas on an html element */
	this.setup = function($id){
		this.$id = $id;
		this.createPaper();
		this.forbidDroppingLinksOnEmptySpace();
		this.editor.install(this);
	}
	
	/** getters and setters */
	this.parent = function(){ return $('#'+this.$id).parent(); };	
	this.el = function(){ return $('#'+this.$id); };	
	this.id = function(){ return this.$id; };		
	this.getGraph = function(){ return this.graph; };	
	this.getPaper = function(){ return this.paper; }		
	this.getEditor = function(){ return this.editor; }
		
	/** create default joint paper */
	this.createPaper = function(){
		this.paper = new joint.dia.Paper({
			el: $('#'+this.$id),		
			gridSize: 1,
			model: this.graph,		
			width: $('#'+this.$id).parent().width()*2,
			height: $('#'+this.$id).parent().height()*2,		
			linkView: joint.dia.LinkView.extend({ //switch creating vertices with single click to double click
				pointerdblclick: function(evt, x, y) {
					if (V(evt.target).hasClass('connection') || V(evt.target).hasClass('connection-wrap')) {
						this.addVertex({ x: x, y: y });
					}
				}
			}),
			interactive: function(cellView) {
				if (cellView.model instanceof joint.dia.Link) return { vertexAdd: false };
				return true;
			}
		});
	}
	
	/** forbid interactions in all links at the paper */
	this.forbidInteractionsOnAllLinks = function(){
		_.each(this.graph.getLinks(), function(link){
			var linkView = this.paper.findViewByModel(link);
			linkView.options.interactive = false;
		});
	}

	/** forbid dropping links on an empty space at the paper */
	this.forbidDroppingLinksOnEmptySpace = function(){	
		var recordedTgt = null;
		var recordedSrc = null
		this.paper.on('cell:pointerdown ', function(cellView, evt, x, y) { 
			if(cellView.model.isLink() && cellView.targetView != null) recordedTgt = cellView.model.get('target');
			if(cellView.model.isLink() && cellView.sourceView != null) recordedSrc = cellView.model.get('source');
		})
		this.paper.on('cell:pointerup ', function(cellView, evt, x, y) { 
			if(cellView.model.isLink() && cellView.targetView == null){
				if(recordedTgt == null){
					recordedTgt = cellView.model.get('target');
					if(recordedTgt==null) cellView.remove();
				}else{
					cellView.model.set('target', recordedTgt);
					recordedTgt = null;
				}
			}
			if(cellView.model.isLink() && cellView.sourceView == null){
				if(recordedSrc == null){
					recordedSrc = cellView.model.get('source');
					if(recordedSrc==null) cellView.remove();
				}else{
					cellView.model.set('source', recordedSrc);
					recordedSrc = null;
				}
			}			
		});
	}	
	
	/** show or hide all dashed links of all gen sets */
	this.displayAllGenSetLinks = function(visibility){		
		_.each(this.getGraph().getLinks(), function(link){
			if(!(link instanceof joint.shapes.mcore.MRelationship) && !(link instanceof joint.shapes.mcore.MGeneralization)) {
				link.attr('./display', visibility);	
			}
		});			
	}
	
	/** show or hide all dashed links of a particular genset */
	this.displayGenSetLinks = function(cellView, visibility){
		if(cellView.model instanceof joint.shapes.mcore.MGeneralizationSet){
			this.displayLinks(cellView, visibility);
		}
	}
	
	/** show or hide all links of an element */
	this.displayLinks = function(cellView, visibility){
		_.each(this.getGraph().getConnectedLinks(cellView.model), function(link){
			link.attr('./display', visibility);
		});
	}
	
	/** drag a link from a particular cellView */
	this.dragLinkFrom = function(evt, link, cellView){		
		link.set("source", {id: cellView.model.get("id")});
		link.set("target", this.getPaper().snapToGrid({x: evt.clientX, y: evt.clientY }));			
		this.getGraph().addCell(link, {validation: false});
		var linkView = this.getPaper().findViewByModel(link);
		linkView.startArrowheadMove("target");
		$("body").mouseup(function(evt){		
			linkView.pointerup(evt);
			$("body").unbind();
		});
		$("body").mousemove((function(evt){
			var coords = this.getPaper().snapToGrid({x: evt.clientX, y: evt.clientY });
			linkView.pointermove(evt, coords.x, coords.y)
		}).bind(this));		
	};	
	
	/** drag and drop a dashed link between the genset and a generalization */
	this.dragGenToGenSet = function(genView, evt){
		var graph = this.getGraph();
		var paper = this.getPaper();
		if(!_.isEmpty(genView.model.get('link'))) graph.getCell(genView.model.get('link').id).remove();
		genView.model.set('link', new joint.dia.Link({						 
			source: midPoint(genView),						
		}));
		genView.model.get('link').attr('.marker-vertices', { display : 'none' });
        genView.model.get('link').attr('.marker-arrowheads', { display: 'none' });
        genView.model.get('link').attr('.connection-wrap', { display: 'none' });
        genView.model.get('link').attr('.link-tools', { display : 'none' });
		genView.model.get('link').attr('.connection', { 'stroke-dasharray': '5,5' });	
		genView.model.get('link').set('target',paper.snapToGrid({x: evt.clientX, y: evt.clientY}));
		graph.addCell(genView.model.get('link'), {validation: false});
		var linkView = paper.findViewByModel(genView.model.get('link'));
		linkView.startArrowheadMove("target");
		$("body").mouseup(function(evt){		
			linkView.pointerup(evt);
			$("body").unbind();
			genView.model.get('link').set('source',midPoint(genView));
			genView.model.get('link').attr('./display', 'none') //hide the line	
		});
		$("body").mousemove(function(evt){
			var coords = paper.snapToGrid({
				x: evt.clientX,
				y: evt.clientY
			});
			linkView.pointermove(evt, coords.x, coords.y)
		});	
		graph.getCell(genView.model.get('source').id).on('add change:position', function(){
			genView.model.get('link').set('source', midPoint(genView));
		});
		graph.getCell(genView.model.get('target').id).on('add change:position', function(){
			genView.model.get('link').set('source', midPoint(genView));
		});
	};
}
