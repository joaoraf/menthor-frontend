
function Canvas(){
	
	this.$id = null;
	this.graph = null;	
	this.paper = null;
	
	this.parent = function(){ return $('#'+this.$id).parent(); };	
	this.el = function(){ return $('#'+this.$id); };	
	this.id = function(){ return this.$id; };	
	
	this.getGraph = function(){ return this.graph; };	
	this.getPaper = function(){ return this.paper; }
		
	this.installOn = function($id){
		this.$id = $id;
		this.graph = new joint.dia.Graph();
		this.paper = new joint.dia.Paper({
			el: this.el(),		
			gridSize: 1,
			model: this.graph,		
			width: this.parent().width()*2,
			height: this.parent().height()*2,
			
			//switch creating vertices with single click to double click
			linkView: joint.dia.LinkView.extend({
				pointerdblclick: function(evt, x, y) {
					if (V(evt.target).hasClass('connection') || V(evt.target).hasClass('connection-wrap')) {
						this.addVertex({ x: x, y: y });
					}
				}
			}),
			interactive: function(cellView) {
				if (cellView.model instanceof joint.dia.Link) {
					// Disable the default vertex add functionality on pointerdown.
					return { vertexAdd: false };
				}
				return true;
			}
		});		
	};
	
	this.forbidInteractionsOnAllLinks = function(){
		_.each(this.graph.getLinks(), function(link){
			var linkView = this.paper.findViewByModel(link);
			linkView.options.interactive = false;
		});
	}

	this.forbidDroppingLinksOnEmptySpace = function(){	
		var recordedTgt = null;
		var recordedSrc = null
		this.paper.on('cell:pointerdown ', function(cellView, evt, x, y) { 
			if(cellView.model.isLink() && cellView.targetView != null){
				recordedTgt = cellView.model.get('target');
			}
			if(cellView.model.isLink() && cellView.sourceView != null){
				recordedSrc = cellView.model.get('source');
			}
		})
		this.paper.on('cell:pointerup ', function(cellView, evt, x, y) { 
			if(cellView.model.isLink() && cellView.targetView == null){
				if(recordedTgt == null){
					recordedTgt = cellView.model.get('target');
					if(recordedTgt==null) {						
						cellView.remove();
					}
				}else{
					cellView.model.set('target', recordedTgt);
					recordedTgt = null;
				}
			}
			if(cellView.model.isLink() && cellView.sourceView == null){
				if(recordedSrc == null){
					recordedSrc = cellView.model.get('source');
					if(recordedSrc==null) {						
						cellView.remove();
					}
				}else{
					cellView.model.set('source', recordedSrc);
					recordedSrc = null;
				}
			}			
		});
	}	
	
	this.displayAllGenSetLinks = function(visibility){		
		_.each(this.getGraph().getLinks(), function(link){
			if(!(link instanceof joint.shapes.mcore.MRelationship) && !(link instanceof joint.shapes.mcore.MGeneralization)) {
				link.attr('./display', visibility);	
			}
		});			
	}
	
	this.displayGenSetLinks = function(cellView, visibility){
		if(cellView.model instanceof joint.shapes.mcore.MGeneralizationSet){
			this.displayLinks(cellView, visibility);
		}
	}
	
	this.displayLinks = function(cellView, visibility){
		_.each(this.getGraph().getConnectedLinks(cellView.model), function(link){
			link.attr('./display', visibility);
		});
	}
	
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
