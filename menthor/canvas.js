
/** 
  * It requires a div in the main html code to put the joint paper (e.g. '<div/> class=canvas').
  */
function Canvas(){
	
	this.graph = null;
	this.htmlElemId = null;
	this.paper = null;
	
	this.installOn = function(htmlElemId){
		this.htmlElemId = htmlElemId;
		this.graph = new joint.dia.Graph();
		this.paper = new joint.dia.Paper({
			el: this.htmlElem(),		
			gridSize: 1,
			model: this.graph,		
			width: this.parentHtmlElem().width()*2,
			height: this.parentHtmlElem().height()*2,
			
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

	this.parentHtmlElem = function(){
		return $('#'+this.htmlElemId).parent();
	};
	
	this.htmlElem = function(){
		return $('#'+this.htmlElemId);
	};
	
	this.getHtmlElemId = function(){
		return this.htmlElemId;
	};
	
	this.getGraph = function(){
		return this.graph;
	};
	
	this.getPaper = function(){
		return this.paper;
	}
		
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
					cellView.remove();
				}else{
					cellView.model.set('target', recordedTgt);
					recordedTgt = null;
				}
			}
			if(cellView.model.isLink() && cellView.sourceView == null){
				if(recordedSrc == null){
					cellView.remove();
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
	
	this.dragGenToGenSet = function(gen, evt){
		var graph = this.getGraph();
		var paper = this.getPaper();
		gen.set('link', new joint.dia.Link({						 
			source: { x: midPoint(graph, gen).x, y:midPoint(graph, gen).y },			
		}));
		gen.get('link').attr('.connection', { 'stroke-dasharray': '5,5' });	
		gen.get('link').set('target',paper.snapToGrid({x: evt.clientX, y: evt.clientY}));
		graph.addCell(gen.get('link'), {validation: false});
		var linkView = paper.findViewByModel(gen.get('link'));
		linkView.startArrowheadMove("target");
		$("body").mouseup(function(evt){		
			linkView.pointerup(evt);
			$("body").unbind();
			gen.get('link').set('source',{ x: midPoint(graph, gen).x, y:midPoint(graph, gen).y });
			gen.get('link').attr('./display', 'none') //hide the line	
		});
		$("body").mousemove(function(evt){
			var coords = paper.snapToGrid({
				x: evt.clientX,
				y: evt.clientY
			});
			linkView.pointermove(evt, coords.x, coords.y)
		});	
		graph.getCell(gen.get('source').id).on('add change:position', function(){
			gen.get('link').set('source', { x: midPoint(graph, gen).x, y: midPoint(graph, gen).y });
		});
		graph.getCell(gen.get('target').id).on('add change:position', function(){
			gen.get('link').set('source', { x: midPoint(graph, gen).x, y: midPoint(graph, gen).y });
		});
	};
}
