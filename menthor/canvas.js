
function Canvas(){
	
	this.language = "MCore";
	
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
		this.cannotDropLinksOnPaper();
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
			
			//switch creating vertices with single click to double click
			linkView: joint.dia.LinkView.extend({ 
				pointerdblclick: function(evt, x, y) {
					if (V(evt.target).hasClass('connection') || V(evt.target).hasClass('connection-wrap')) { this.addVertex({ x: x, y: y }); }
				}
			}),			
			interactive: function(cellView) { if (cellView.model instanceof joint.dia.Link) return { vertexAdd: false }; return true; }
		});
	}
	
	/** drag a link from a particular cellView */
	this.dragLinkFrom = function(evt, linkShape, cellView){		
		var linkView = this.getEditor().startDraggingLink(linkShape, cellView, evt);		
		$("body").mouseup((function(evt){		
			linkView.pointerup(evt);
			$("body").unbind();
			this.getEditor().endDroppingLink(linkShape, cellView, evt);
		}).bind(this));
		$("body").mousemove((function(evt){
			var coords = this.getPaper().snapToGrid({x: evt.clientX, y: evt.clientY });
			linkView.pointermove(evt, coords.x, coords.y)
		}).bind(this));		
	};	
	
	/** drag and drop a dashed link between a generalization and its generalization set*/
	this.dragGSLink = function(genView, evt){
		var linkView = this.getEditor().startDraggingGSLink(genView, evt);		
		$("body").mouseup((function(evt){		
			linkView.pointerup(evt);
			$("body").unbind();
			this.getEditor().endDroppingGSLink(genView, evt);			
		}).bind(this));
		$("body").mousemove((function(evt){
			var coords = this.getPaper().snapToGrid({ x: evt.clientX, y: evt.clientY });
			linkView.pointermove(evt, coords.x, coords.y)
		}).bind(this));					
	};
	
	/** show or hide all links of an element */
	this.displayLinks = function(cellView, visibility){
		_.each(this.getGraph().getConnectedLinks(cellView.model), function(link){
			link.attr('./display', visibility);
		});
	};
		
	/** show or hide all dashed links of all gen sets */
	this.displayAllGSLinks = function(visibility){		
		_.each(this.getGraph().getLinks(), function(link){
			if(!(link instanceof joint.shapes.mcore.MRelationship) && !(link instanceof joint.shapes.mcore.MGeneralization)) {
				link.attr('./display', visibility);	
			}
		});			
	}
	
	/** show or hide all dashed links of a particular genset */
	this.displayGSLinks = function(cellView, visibility){
		if(cellView.model instanceof joint.shapes.mcore.MGeneralizationSet){
			this.displayLinks(cellView, visibility);
		}
	}
	
	/** forbid interactions in all links at the paper */
	this.cannotInteractWithLinks = function(){
		_.each(this.graph.getLinks(), function(link){
			var linkView = this.paper.findViewByModel(link);
			linkView.options.interactive = false;
		});
	}

	/** forbid dropping links on an empty space at the paper */
	this.cannotDropLinksOnPaper = function(){	
		var recordedTgt = null;		
		var recordedSrc = null
		this.paper.on('cell:pointerdown ', function(cellView, evt, x, y) {
			if(cellView.model.isLink() && cellView.targetView != null) recordedTgt = cellView.model.get('target');
			if(cellView.model.isLink() && cellView.sourceView != null) recordedSrc = cellView.model.get('source');
		})
		this.paper.on('cell:pointerup ', function(cellView, evt, x, y) { 
			if(cellView.model.isLink() && cellView.targetView === null){				
				if(recordedTgt === null){					
					cellView.remove();
				}else{
					cellView.model.set('target', recordedTgt); 
					recordedTgt = null;
				}
			}
			if(cellView.model.isLink() && cellView.sourceView === null){				
				if(recordedSrc === null){					
					cellView.remove();
				}else{
					cellView.model.set('source', recordedSrc); 
					recordedSrc = null;
				}
			}			
		});
	}	
}
