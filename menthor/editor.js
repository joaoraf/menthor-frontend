
/** 
  * It assumes to have div's with classes such as 'diagram'
  */
function Edition(){
	
	/** last event registred */
	Edition.lastEvent = null;
	
	/** selected elements */
	Edition.selection = [];
	
	/** the canvas attached to this edition */
	this.canvas = null;
	
	/** install editing/selecting capability on a canvas */
	this.installOn = function (canvas){
		this.canvas = canvas;
		Edition.selection = [];
		Edition.lastEvent = null;		
		this.installEditor();
		this.installSelection();		
	};
	
	/** install a single editor wrapper box for each diagram */
	this.installEditor = function(){
		var editor = $(
			"<div id=\"editor\">"+
				"<div class=\"resize nw\"></div>"+
				"<div class=\"resize n\"></div>"+
				"<div class=\"resize ne\"></div>"+
				"<div class=\"resize e\"></div>"+
				"<div class=\"resize se\"></div>"+
				"<div class=\"resize s\"></div>"+
				"<div class=\"resize sw\"></div>"+
				"<div class=\"resize w\"></div>"+
				"<div class=\"tools delete\" title=\"Delete\"></div>"+
				"<div class=\"tools duplicate\" title=\"Duplicate\"></div>"+
				"<div class=\"tools connect\" title=\"Connect\"></div>"+			
			"</div>"
		);
		this.canvas.parent().append(editor);	
		this.installDelete();
		this.installDuplicate();
		this.installResizeN()
		this.installResizeS()
		this.installResizeE()
		this.installResizeW()
		this.installResizeSE()
		this.installResizeSW()
		this.installResizeNW()
		this.installResizeNE()
		return editor;		
	};
	
	/** the selected elements */
	this.selected = function() { return Edition.selection; };
	
	/** the first element selected */
	this.firstSelected = function(){ return this.selected()[0]; };
	
	/** the last element selected */
	this.lastSelected = function(){ return this.selected()[this.selected().length-1]; };
	
	this.deselectAll = function(){
		this.destroyBoxes();
		Edition.selection = [];
	};
	
	this.selectAll = function(){
		var elems = this.canvas.getGraph().getElements();
		_.each(elems, (function(elem){
			var cellView = this.canvas.getPaper().findViewByModel(elem);
			if(!this.isSelected(cellView)) this.select(cellView);
		}).bind(this));
	};
	
	this.deselect = function(cellView){		
		if(this.isSelected(cellView)) {
			this.destroyCellBoxes(cellView);
			remove(this.selected(), cellView);
		}	
	};
	
	this.deleteCell = function(cellView){		
		/** delete the genset-dashed link if the generalization is deleted */
		var links = this.canvas.getGraph().getConnectedLinks(cellView.model);		
		_.each(links, (function(link){			
			if(link instanceof joint.shapes.mcore.MGeneralization){							
				if(!_.isEmpty(link.get('link'))){
					var gensetLinkView = this.canvas.getPaper().findViewByModel(link.get('link'));
					this.$super.deleteCell.call(this,gensetLinkView);						
				}				
			}
		}).bind(this));
		this.canvas.getGraph().getCell(cellView.model.get("id")).remove();
	};
	
	this.deleteSelected = function(){
		_.each(this.selected(), (function(selected){						
			this.deleteCell(selected);				
		}).bind(this));
		this.deselectAll();
	};
	
	this.duplicateSelected = function(){		
		var newSelected = []
		if(this.canvas==null) return;
		_.each(this.selected(), (function(selected){						
			var newCell = this.canvas.getGraph().getCell(selected.model.get("id")).clone().clone();
			this.canvas.getGraph().addCell(newCell);			
			newCell.translate(20, 20);
			newSelected.push(newCell);
		}).bind(this));
		this.deselectAll();
		Edition.selection.push.apply(Edition.selection, newSelected);
		this.installCellSelectionBoxes();
		this.updateBoxes();
	};
	
	this.isSelected = function(cellView){
		if($.inArray(cellView, this.selected())<0) return false;
		else return true;
	};
	
	this.select = function(cellView){
		if(!this.isSelected(cellView)) {
			Edition.selection.push(cellView);				
			this.installCellSelectionBox(cellView);
			this.updateCellBoxes(cellView); 
		}
	};
	
	this.canSelect = function(cellView){
		return cellView.model instanceof joint.shapes.mcore.MType || cellView.model instanceof joint.shapes.mcore.MGeneralizationSet;
	};
	
	this.clickOnCell = function(cellView, evt){
		if(this.canSelect(cellView)){	
			if(!this.isSelected(cellView)) {			
				if (!(evt.ctrlKey || evt.metaKey)) this.deselectAll();				
				this.select(cellView); 						
			}else{
				this.deselect(cellView);
			}			
		}		
	};
	
	this.clickOnPaper = function(){
		this.deselectAll();
	};
	
	this.moveCell = function(cellView, evt){
		if(this.canSelect(cellView)) {
			this.updateCellBoxes(cellView);
			_.each(this.selected(), (function(cellSelected){
				if(cellSelected!=cellView){					
					var dx = evt.clientX - Edition.lastEvent.clientX;					
					var dy = evt.clientY - Edition.lastEvent.clientY;
					var cell = this.canvas.getGraph().getCell(cellSelected.model.get("id"));					
					cell.translate(dx, dy);				
					this.updateCellBoxes(cellSelected);
				}						
			}).bind(this));
		}
	};
	
	this.installDelete = function(){
		$(".delete").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation(); this.deleteSelected(); }).bind(this));
	};
	
	this.installDuplicate = function(){
		$(".duplicate").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation(); this.duplicateSelected(); }).bind(this));
	};
	
	this.installResizeN = function(){
		$(".n").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation();
			$("body").mouseup  ((function(evt) { evt.preventDefault(); evt.stopPropagation(); $("body").unbind(); }).bind(this));
			$("body").mousemove((function(evt) { resizeN(this, evt, this.canvas.getGraph()); }).bind(this));
		}).bind(this));
	};
	
	this.installResizeS = function(){
		$(".s").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation();
			$("body").mouseup  ((function(evt) { evt.preventDefault(); evt.stopPropagation(); $("body").unbind();}).bind(this));
			$("body").mousemove((function(evt) { resizeS(this, evt, this.canvas.getGraph()); }).bind(this));
		}).bind(this));
	};

	this.installResizeW = function(){
		$(".w").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation();
			$("body").mouseup  ((function(evt){ evt.preventDefault(); evt.stopPropagation(); $("body").unbind(); }).bind(this));
			$("body").mousemove((function(evt){ resizeW(this, evt, this.canvas.getGraph()); }).bind(this));
		}).bind(this));	
	};

	this.installResizeE = function (){
		$(".e").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation();
			$("body").mouseup  ((function(evt){ evt.preventDefault(); evt.stopPropagation(); $("body").unbind(); }).bind(this));
			$("body").mousemove((function(evt){ resizeE(this, evt, this.canvas.getGraph()); }).bind(this));
		}).bind(this));	
	};

	this.installResizeSE = function(){
		$(".se").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation();
			$("body").mouseup  ((function(evt){ evt.preventDefault(); evt.stopPropagation(); $("body").unbind(); }).bind(this));
			$("body").mousemove((function(evt){ resizeSE(this, this.evt, canvas.getGraph()) }).bind(this));
		}).bind(this));	
	};

	this.installResizeSW = function(){
		$(".sw").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation();
			$("body").mouseup  ((function(evt){ evt.preventDefault(); evt.stopPropagation(); $("body").unbind(); }).bind(this));
			$("body").mousemove((function(evt){	resizeSW(this, this.evt, canvas.getGraph()) }).bind(this));
		}).bind(this));
	};
		
	this.installResizeNW = function(){
		$(".nw").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation();
			$("body").mouseup  ((function(evt){ evt.preventDefault(); evt.stopPropagation(); $("body").unbind(); }).bind(this));
			$("body").mousemove((function(evt){ resizeNW(this, this.evt, canvas.getGraph()) }).bind(this));
		}).bind(this));	
	};
	
	this.installResizeNE = function(){
		$(".ne").mousedown((function(evt) { evt.preventDefault(); evt.stopPropagation();
			$("body").mouseup  ((function(evt){ evt.preventDefault(); evt.stopPropagation(); $("body").unbind(); }).bind(this));
			$("body").mousemove((function(evt){ resizeNE(this, evt, this.canvas.getGraph()) }).bind(this));
		}).bind(this));
	};
	
	var resizeN = function(edition, evt, graph){
		_.each(edition.selected(), function(cellView){ resizeCellN(edition, evt, graph, cellView); });
		Edition.lastEvent = evt;
	};
	
	var resizeS = function(edition, evt, graph){ 
		_.each(edition.selected(), function(cellView){ resizeCellS(edition, evt, graph, cellView); });
		Edition.lastEvent = evt;
	};
	
	var resizeE = function(edition, evt, graph){
		_.each(edition.selected(), function(cellView){ resizeCellE(edition, evt, graph, cellView); });
		Edition.lastEvent = evt;
	};
	
	var resizeSE = function(edition, evt, graph){
		_.each(edition.selected(), function(cellView){ resizeCellSE(edition, evt, graph, cellView); });
		Edition.lastEvent = evt;
	};
	
	var resizeNE = function(edition, evt, graph){
		_.each(edition.selected(), function(cellView){ resizeCellNE(edition, evt, graph, cellView); });
		Edition.lastEvent = evt;
	};
	
	var resizeSW = function(edition, evt, graph){
		_.each(edition.selected(), function(cellView){ resizeOnSouthweast(edition, evt, graph, cellView); });
		Edition.lastEvent = evt;
	};
	
	var resizeNW = function(edition, evt, graph){
		_.each(edition.selected(), function(cellView){ resizeCellNW(edition, evt, graph, cellView); });
		Edition.lastEvent = evt;
	};
	
	var resizeW = function(edition, evt, graph){
		_.each(edition.selected(), function(cellView){ resizeCellW(edition, evt, graph, cellView); });
		Edition.lastEvent = evt;
	};
	
	var resizeCellN = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var view = $("#"+cellView.id);
			var step = Math.abs(Edition.lastEvent.pageY-evt.pageY) > 10?(Edition.lastEvent.pageY-evt.pageY > 0?10:-10):Edition.lastEvent.pageY-evt.pageY;
			if(cell.get("size").height > 10 || step > 0){
				cell.translate(0, -(step));
				cell.resize(cell.get("size").width, cell.get("size").height+(step));
				edition.updateCellBoxes(cellView);
			}
		}		
	}
	
	var resizeCellS = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Edition.lastEvent.pageY-evt.pageY) > 10?(Edition.lastEvent.pageY-evt.pageY > 0?10:-10):Edition.lastEvent.pageY-evt.pageY;
			if(cell.get("size").height > 10 || step < 0){
				cell.resize(cell.get("size").width, cell.get("size").height-(step));				
				edition.updateCellBoxes(cellView);
			}
		}		
	};
		
	var resizeCellW = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Edition.lastEvent.pageX-evt.pageX) > 10?(Edition.lastEvent.pageX-evt.pageX > 0?10:-10):Edition.lastEvent.pageX-evt.pageX;			
			if(cell.get("size").width > 10 || step > 0){
				cell.translate(-(step), 0);
				cell.resize(cell.get("size").width+(step), cell.get("size").height);
				edition.updateCellBoxes(cellView);
			}
		}		
	};
	
	var resizeCellE = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Edition.lastEvent.pageX-evt.pageX) > 10?(Edition.lastEvent.pageX-evt.pageX > 0?10:-10):Edition.lastEvent.pageX-evt.pageX;				
			if(cell.get("size").width > 10 || step < 0){
				cell.resize(cell.get("size").width-(step), cell.get("size").height);
				edition.updateCellBoxes(cellView);
			}
		}		
	};
		
	var resizeCellSE = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var stepX = Math.abs(Edition.lastEvent.pageX-evt.pageX) > 10?(Edition.lastEvent.pageX-evt.pageX > 0?10:-10):Edition.lastEvent.pageX-evt.pageX;
			var stepY = Math.abs(Edition.lastEvent.pageY-evt.pageY) > 10?(Edition.lastEvent.pageY-evt.pageY > 0?10:-10):Edition.lastEvent.pageY-evt.pageY;				
			if(cell.get("size").width > 10 || stepX < 0){
				cell.resize(cell.get("size").width-(stepX), cell.get("size").height);
			}
			if(cell.get("size").height > 10 || stepY < 0){
				cell.resize(cell.get("size").width, cell.get("size").height-(stepY));						
			}
			edition.updateCellBoxes(cellView);
		}		
	};

	var resizeCellNE = function(edition, evt, graph, cellView){		
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var stepX = Math.abs(Edition.lastEvent.pageX-evt.pageX) > 10?(Edition.lastEvent.pageX-evt.pageX > 0?10:-10):Edition.lastEvent.pageX-evt.pageX;
			var stepY = Math.abs(Edition.lastEvent.pageY-evt.pageY) > 10?(Edition.lastEvent.pageY-evt.pageY > 0?10:-10):Edition.lastEvent.pageY-evt.pageY;				
			if(cell.get("size").width > 10 || stepX < 0){
				cell.resize(cell.get("size").width-(stepX), cell.get("size").height);						
			}					
			if(cell.get("size").height > 10 || stepY > 0){
				cell.translate(0, -(stepY));
				cell.resize(cell.get("size").width, cell.get("size").height+(stepY));
			}
			edition.updateCellBoxes(cellView);
		}		
	};
	
	var resizeCellSW = function(edition, evt, graph, cellView){		
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var stepX = Math.abs(Edition.lastEvent.pageX-evt.pageX) > 10?(Edition.lastEvent.pageX-evt.pageX > 0?10:-10):Edition.lastEvent.pageX-evt.pageX;
			var stepY = Math.abs(Edition.lastEvent.pageY-evt.pageY) > 10?(Edition.lastEvent.pageY-evt.pageY > 0?10:-10):Edition.lastEvent.pageY-evt.pageY;				
			if(cell.get("size").width > 10 || stepX > 0){
				cell.translate(-stepX, 0);
				cell.resize(cell.get("size").width+stepX, cell.get("size").height);
			}
			if(cell.get("size").height > 10 || stepY < 0){
				cell.resize(cell.get("size").width, cell.get("size").height-stepY);
			}
			edition.updateCellBoxes(cellView);
		}		
	};
	
	var resizeCellNW = function(edition, evt, graph, cellView){	
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var stepX = Math.abs(Edition.lastEvent.pageX-evt.pageX) > 10?(Edition.lastEvent.pageX-evt.pageX > 0?10:-10):Edition.lastEvent.pageX-evt.pageX;
			var stepY = Math.abs(Edition.lastEvent.pageY-evt.pageY) > 10?(Edition.lastEvent.pageY-evt.pageY > 0?10:-10):Edition.lastEvent.pageY-evt.pageY;				
			if(cell.get("size").width > 10 || stepX > 0){
				cell.translate(-(stepX), 0);
				cell.resize(cell.get("size").width+(stepX), cell.get("size").height);
			}
			if(cell.get("size").height > 10 || stepY > 0){
				cell.translate(0, -(stepY));
				cell.resize(cell.get("size").width, cell.get("size").height+(stepY));
			}
			edition.updateCellBoxes(cellView);
		}		
	};
	
	/** update the editor wrapper box over a cell */
	this.updateEditor = function(cell, top, left, width, height){
		if(cell !=null && this.firstSelected()===cell){
			$("#editor").css("top", top);	
			$("#editor").css("left", left);		
			$("#editor").width(width);
			$("#editor").height(height);			
			$("#editor").show();
			if(cell.model instanceof joint.shapes.mcore.MGeneralizationSet) { 
				$(".connect").hide(); $(".s").hide(); $(".n").hide(); $(".sw").hide(); $(".nw").hide(); $(".se").hide(); $(".ne").hide(); $(".e").hide(); $(".w").hide();				
			}else { 
				$(".connect").show(); $(".s").show(); $(".n").show(); $(".sw").show(); $(".nw").show(); $(".se").show(); $(".ne").show(); $(".e").show(); $(".w").show();
			}			
		}
	};
	
	/** hide the editor wrapper box (wherever it is located) */
	this.hideEditor = function(){		
		$("#editor").hide();		
	};
		
	/** install a selection wrapper box for each diagram which envolves a number of single selections */
	this.installSelection = function(){
		var selectionWrapperBox = $("<div id=\"selection-wrapper\"> </div>");
		this.canvas.parent().append(selectionWrapperBox);
		this.canvas.getPaper().on('cell:pointerdown', (function(cellView, evt, x, y){
			this.clickOnCell(cellView, evt);
			Edition.lastEvent = evt;
		}).bind(this));			
		this.canvas.getPaper().on('blank:pointerdown', (function(cellView, evt, x, y){
			this.clickOnPaper();
			Edition.lastEvent = evt;					
		}).bind(this));
		this.canvas.getPaper().on('cell:pointermove', (function(cellView, evt, x, y){
			this.moveCell(cellView, evt);
			Edition.lastEvent = evt;		
		}).bind(this));	
		this.canvas.getPaper().on('cell:pointerdblclick', (function(cellView, evt, x, y){			
			Edition.lastEvent = evt;
		}).bind(this));
		return selectionWrapperBox;		
	};
	
	/** create a single selection box dynamically according to a user click on a cell */
	this.installCellSelectionBox = function(cell){
		var selectionBox = $('<div/>', { 'class': 'selection-box', 'id': 'selection-'+cell.id });		
		var bbox = cell.getBBox({ useModelGeometry: true });			
		selectionBox.css("left",bbox.x+"px");
		selectionBox.css("top",bbox.y+"px");
		selectionBox.css({ width: bbox.width, height: bbox.height });		
		$("#selection-wrapper").append(selectionBox);
		return selectionBox;
	};
	
	/** update the single selection box over a cell */
	this.updateCellSelectionBox = function(cell, top, left, width, height){		
		var selectionBox = $('#selection-'+cell.id);
		if(selectionBox!=null){
			var bbox = cell.getBBox({ useModelGeometry: true });	
			selectionBox.css("top",top);
			selectionBox.css("left",left);
			selectionBox.width(width+2);
			selectionBox.height(height+2);				
			selectionBox.show();
			this.canvas.displayGenSetLinks(cell,'block'); // show gen set links
		}		
	};
	
	/** destroy the single selection box over a cell */
	this.destroyCellSelectionBox = function(cell) {        
		if(cell!=null){
			var selectionBox = document.getElementById('selection-'+cell.id)			
			if(selectionBox!=null){
				var e = document.getElementById('selection-wrapper');				
				e.removeChild(selectionBox);
			}
			this.canvas.displayGenSetLinks(cell,'none'); // hide gen set links				
		}
    };
	
	/** create a single selection box dynamically for each element selected by the user */
	this.installCellSelectionBoxes = function(){
		_.each(this.selected(), (function(selected){
			this.installCellSelectionBox(selected);
		}).bind(this));
	};
	
	/** update boxes (editing and selection boxes) of a cell */
	this.updateCellBoxes = function(cell){		
		var currentScale = 1;
		if(cell != null){
			var height = (cell.model.get("size").height+2)*currentScale;
			var width = (cell.model.get("size").width+2)*currentScale;
			var left = ($("#"+cell.id).offset().left-this.canvas.parent().offset().left-2+this.canvas.parent().scrollLeft())+"px";
			var top = ($("#"+cell.id).offset().top-2+this.canvas.parent().scrollTop())+"px";			
			this.updateCellSelectionBox(cell,top,left,width,height);
			this.updateEditor(cell,top,left,width,height);
		}
	};
	
	/** destroy boxes (editing and selection boxes) in an cell */
	this.destroyCellBoxes = function(cell){
		this.destroyCellSelectionBox(cell);
		if(cell === this.firstSelected()) this.hideEditor();
	};
	
	/** update boxes (editing and selection boxes) in the selected elements */
	this.updateBoxes = function(){
		_.each(this.selected(), (function(selected){			
			this.updateCellBoxes(selected);
		}).bind(this));
	};
	
	/** destroy boxes from the elements selected */
	this.destroyBoxes = function(){
		var el = document.getElementById('selection-wrapper');
		while (el.firstChild) el.removeChild(el.firstChild);	
		this.hideEditor();	
		this.canvas.displayAllGenSetLinks('none'); // hide all gen set links						
	};
		
}