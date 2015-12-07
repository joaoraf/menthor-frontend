
/** 
  * It requires a div in the main html code to put the joint paper (e.g. '<div/> class=canvas').
  */
function Canvas(htmlElemId){
		
	this.parentHtmlElem = function(){
		return $('#'+htmlElemId).parent();
	};
	
	this.htmlElem = function(){
		return $('#'+htmlElemId);
	};
	
	this.getHtmlElemId = function(){
		return htmlElemId;
	};
	
	this.graph = new joint.dia.Graph;
	
	this.getGraph = function(){
		return this.graph;
	};
	
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
}
