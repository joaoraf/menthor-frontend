function Canvas(htmlElemId){
		
	this.graph = new joint.dia.Graph;
	
	this.canvas = new joint.dia.Paper({
		el: $('#'+htmlElemId),		
		gridSize: 1,
		model: this.graph,		
		width: $('#'+htmlElemId).parent().width()*2,
		height: $('#'+htmlElemId).parent().height()*2,
		
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
		
	this.getHtmlElemId = function(){
		return htmlElemId;
	}
	
	this.getPaper = function(){
		return this.canvas;
	}
	
	this.getGraph = function(){
		return this.graph;
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
		this.canvas.on('cell:pointerdown ', function(cellView, evt, x, y) { 
			if(cellView.model.isLink() && cellView.targetView != null){
				recordedTgt = cellView.model.get('target');
			}
			if(cellView.model.isLink() && cellView.sourceView != null){
				recordedSrc = cellView.model.get('source');
			}
		})
		this.canvas.on('cell:pointerup ', function(cellView, evt, x, y) { 
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
