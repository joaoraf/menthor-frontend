
/** 
  * It assumes to have div's with classes such as 'diagram', 'selection-wrapper', 'editor', 'duplicate', 'delete', etc. 
  */
function Edition(){
		
	Edition.lastEvent = null;
	Edition.selection = [];
	
	this.firstSelected = function(){
		return Edition.selection[0];
	};
	
	this.lastSelected = function(){
		return Edition.selection[Edition.selection.length-1];
	};
	
	this.installOn = function (canvas){
		Edition.selection = [];
		Edition.lastEvent = null;
		this.installSelection(canvas)
		this.installDelete(canvas)
		this.installDuplicate(canvas)
		this.installResizeN(canvas)
		this.installResizeS(canvas)
		this.installResizeE(canvas)
		this.installResizeW(canvas)
		this.installResizeSE(canvas)
		this.installResizeSW(canvas)
		this.installResizeNW(canvas)
		this.installResizeNE(canvas)
	};
	
	this.deselectAll = function(){
		this.destroyBoxesFromSelection();
		Edition.selection = [];
	}
	
	this.installSelection = function(canvas){
		
		canvas.getPaper().on('cell:pointerclick', (function(cellView, evt, x, y){
			if(cellView.model instanceof joint.shapes.mcore.MType || cellView.model instanceof joint.shapes.mcore.MGeneralizationSet){
				if (!(evt.ctrlKey || evt.metaKey)) {
					this.destroyBoxesFromSelection();
					Edition.selection = [];			
				}			
				Edition.selection.push(cellView);				
				this.createSelectionBox(cellView);
				this.updateBoxes(cellView); 
			}
		}).bind(this));
	
		canvas.getPaper().on('blank:pointerdown', (function(cellView, evt, x, y){
			this.destroyBoxesFromSelection();		
			Edition.selection = [];						
		}).bind(this));
	
		canvas.getPaper().on('cell:pointermove', (function(cellView, evt, x, y){
			if(cellView.model instanceof joint.shapes.mcore.MType || cellView.model instanceof joint.shapes.mcore.MGeneralizationSet){
				if(!inArray(Edition.selection,cellView)){
					if (!(evt.ctrlKey || evt.metaKey)) {
						this.destroyBoxesFromSelection();
						Edition.selection = [];			
					}						
					Edition.selection.push(cellView);											
					this.createSelectionBox(cellView);
				}
				this.updateBoxes(cellView);
			}
		}).bind(this));	
	};
				
	//=====================
	//Update Boxes
	//=====================
	
	/** a box is composed by a selection box and editing box */
	this.updateBoxes = function(cell){		
		var currentScale = 1;
		if(cell != null){
			var height = (cell.model.get("size").height+2)*currentScale;
			var width = (cell.model.get("size").width+2)*currentScale;
			var left = ($("#"+cell.id).offset().left-$("#diagram").offset().left-2+$("#diagram").scrollLeft())+"px";
			var top = ($("#"+cell.id).offset().top-2+$("#diagram").scrollTop())+"px";			
			this.updateSelectionBox(cell,top,left,width,height);
			this.updateEditingBox(cell,top,left,width,height);
		}
	};
	
	/** create selection boxes into all selected elements */
	this.updateBoxesFromSelection = function(){
		_.each(Edition.selection, (function(selected){			
			this.updateBoxes(selected);
		}).bind(this));
	};
		
	/** editing box which contains a delete, duplicate and connect button. */
	this.updateEditingBox = function(cell, top, left, width, height){
		if(cell !=null && this.firstSelected()===cell){
			$("#editor").css("top", top);	
			$("#editor").css("left", left);		
			$("#editor").width(width);
			$("#editor").height(height);			
			$("#editor").show();
			if(cell.model instanceof joint.shapes.mcore.MGeneralizationSet) $(".connect").hide();
			else $(".connect").show();
		}
	};
	
	/** selection box over each element selected */
	this.updateSelectionBox = function(cell, top,left, width, height){		
		var selectionBox = $('#selection-'+cell.id);
		if(selectionBox!=null){
			var bbox = cell.getBBox({ useModelGeometry: true });	
			selectionBox.css("top",top);
			selectionBox.css("left",left);
			selectionBox.width(width+2);
			selectionBox.height(height+2);				
			selectionBox.show(); 
		}		
	};
		
	//=====================
	//Destroy Boxes
	//=====================
		
	/** destroy all selection boxes and the editing box of this cell (if any) */
	this.destroyBoxes = function(cell){
		this.destroySelectionBox(cell);
		if(cell === this.firstSelected()) this.destroyEditingBox();
	};
	
	/** destroy all seelction boxes and the editing box, regardless of which cell they are */
	this.destroyBoxesFromSelection = function(){
		var el = document.getElementById('selection-wrapper');
		while (el.firstChild) el.removeChild(el.firstChild);	
		$("#editor").hide();		
	};
	
	/** destroy the selection box of this cell (if any) */
	this.destroySelectionBox = function(cell) {        
		if(cell!=null){
			var selectionBox = $('#selection-'+cell.id)
			if(selectionBox!=null){
				var el = document.getElementById('selection-wrapper');
				el.removeChild(selectionBox);
			}
		}
    };
	
	/** destroy the editing box (wherever it might be) */
	this.destroyEditingBox = function(){		
		$("#editor").hide();		
	};
	
	//==============================================
	//Create Boxes
	//==============================================
			
	/** a selection box is created dynamically according to a user click on a cell */
	this.createSelectionBox = function(cell){
		var selectionBox = $('<div/>', { 'class': 'selection-box', 'id': 'selection-'+cell.id });		
		var bbox = cell.getBBox({ useModelGeometry: true });			
		selectionBox.css("left",bbox.x+"px");
		selectionBox.css("top",bbox.y+"px");
		selectionBox.css({ width: bbox.width, height: bbox.height });		
		$("#selection-wrapper").append(selectionBox);
		selectionBox.show();		
		return selectionBox;
	};
	
	this.createSelectionBoxFromSelection = function(){
		_.each(Edition.selection, (function(selected){
			this.createSelectionBox(selected);
		}).bind(this));
	};
	
	//==============================================
	//Removal
	//==============================================
	
	this.removeSelection = function(canvas){		
		_.each(Edition.selection, (function(selected){						
			canvas.getGraph().getCell(selected.model.get("id")).remove();
			console.log("Deleted: "+selected);
		}).bind(this));
		this.deselectAll();
	};
	
	this.installDelete = function(canvas){
		$(".delete").mousedown((function(evt){
			evt.preventDefault();
			evt.stopPropagation();				
			this.removeSelection(canvas);
		}).bind(this));
	};

	//==============================================
	//Duplication
	//==============================================
	
	this.duplicateSelection = function(canvas){		
		var newSelected = []
		_.each(Edition.selection, function(selected){						
			var newCell = canvas.getGraph().getCell(selected.model.get("id")).clone().clone();
			canvas.getGraph().addCell(newCell);
			console.log("Duplicated	: "+newCell)
			newCell.translate(10, 10);
			newSelected.push(newCell);
		});			
		this.deselectAll();
		Edition.selection.push.apply(Edition.selection, newSelected);
		this.createSelectionBoxFromSelection();
		this.updateBoxesFromSelection();
	};
		
	this.installDuplicate = function(canvas){
		$(".duplicate").mousedown((function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			this.duplicateSelection(canvas);
		}).bind(this));
	};
	
	//=============================================
	//Resizeable
	//=============================================
	
	this.installResizeN = function(canvas){
		$(".n").mousedown((function(evt){ 
			evt.preventDefault();
			evt.stopPropagation();
			$("body").mouseup(function(evt){ 
				evt.preventDefault();
				evt.stopPropagation();
				$("body").unbind();
			});
			$("body").mousemove((function(evt) {
				resizeSelectionOnNorth(this, evt, canvas.getGraph());
			}).bind(this));
		}).bind(this));
	};
	
	this.installResizeS = function(canvas){
		$(".s").mousedown((function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").mouseup(function(evt){
				evt.preventDefault();
				evt.stopPropagation();
				$("body").unbind();
			});
			$("body").mousemove((function(evt) {
				resizeSelectionOnSouth(this, evt, canvas.getGraph());
			}).bind(this));
		}).bind(this));
	};

	this.installResizeW = function(canvas){
		$(".w").mousedown((function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").mouseup(function(evt){
				evt.preventDefault();
				evt.stopPropagation();
				$("body").unbind();
			});
			$("body").mousemove((function(evt){
				resizeSelectionOnWeast(this, evt, canvas.getGraph());
			}).bind(this));
		}).bind(this));	
	};

	this.installResizeE = function (canvas){
		$(".e").mousedown((function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").mouseup(function(evt){
				evt.preventDefault();
				evt.stopPropagation();
				$("body").unbind();
			});
			$("body").mousemove((function(evt){
				resizeSelectionOnEast(this, evt, canvas.getGraph());
			}).bind(this));
		}).bind(this));	
	};

	this.installResizeSE = function(canvas){
		$(".se").mousedown((function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").mouseup(function(evt){
				evt.preventDefault();
				evt.stopPropagation();
				$("body").unbind();
			});
			$("body").mousemove((function(evt){
				resizeSelectionOnSoutheast(this, evt, canvas.getGraph())
			}).bind(this));
		}).bind(this));	
	};

	this.installResizeSW = function(canvas){
		$(".sw").mousedown((function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").mouseup(function(evt){
				evt.preventDefault();
				evt.stopPropagation();
				$("body").unbind();
			});
			$("body").mousemove((function(evt){				
				resizeSelectionOnSouthweast(this, evt, canvas.getGraph())
			}).bind(this));
		}).bind(this));
	};
		
	this.installResizeNW = function(canvas){
		$(".nw").mousedown((function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").mouseup(function(evt){
				evt.preventDefault();
				evt.stopPropagation();
				$("body").unbind();
			});
			$("body").mousemove((function(evt){
				resizeSelectionOnNorthweast(this, evt, canvas.getGraph())
			}).bind(this));
		}).bind(this));	
	};
	
	this.installResizeNE = function(canvas){
		$(".ne").mousedown((function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			$("body").mouseup(function(evt){
				evt.preventDefault();
				evt.stopPropagation();
				$("body").unbind();
			});
			$("body").mousemove((function(evt){
				resizeSelectionOnNortheast(this, evt, canvas.getGraph())
			}).bind(this));
		}).bind(this));
	};
		
	var resizeSelectionOnNorth = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnNorth(edition, evt, graph, cellView);
		});
		Edition.lastEvent = evt;
	};
	
	var resizeOnNorth = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var view = $("#"+cellView.id);
			var step = Math.abs(Edition.lastEvent.pageY-evt.pageY) > 10?(Edition.lastEvent.pageY-evt.pageY > 0?10:-10):Edition.lastEvent.pageY-evt.pageY;
			if(cell.get("size").height > 10 || step > 0){
				cell.translate(0, -(step));
				cell.resize(cell.get("size").width, cell.get("size").height+(step));
				edition.updateBoxes(cellView);
			}
		}		
	}
	
	var resizeSelectionOnSouth = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){			
			resizeOnSouth(edition, evt, graph, cellView);			
		});
		Edition.lastEvent = evt;
	};
	
	var resizeOnSouth = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Edition.lastEvent.pageY-evt.pageY) > 10?(Edition.lastEvent.pageY-evt.pageY > 0?10:-10):Edition.lastEvent.pageY-evt.pageY;
			if(cell.get("size").height > 10 || step < 0){
				cell.resize(cell.get("size").width, cell.get("size").height-(step));				
				edition.updateBoxes(cellView);
			}
		}		
	};
	
	var resizeSelectionOnWeast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnWeast(edition, evt, graph, cellView);
		});
		Edition.lastEvent = evt;
	};
	
	var resizeOnWeast = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Edition.lastEvent.pageX-evt.pageX) > 10?(Edition.lastEvent.pageX-evt.pageX > 0?10:-10):Edition.lastEvent.pageX-evt.pageX;			
			if(cell.get("size").width > 10 || step > 0){
				cell.translate(-(step), 0);
				cell.resize(cell.get("size").width+(step), cell.get("size").height);
				edition.updateBoxes(cellView);
			}
		}		
	};
	
	var resizeSelectionOnEast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnEast(edition, evt, graph, cellView);
		});
		Edition.lastEvent = evt;
	};
	
	var resizeOnEast = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Edition.lastEvent.pageX-evt.pageX) > 10?(Edition.lastEvent.pageX-evt.pageX > 0?10:-10):Edition.lastEvent.pageX-evt.pageX;				
			if(cell.get("size").width > 10 || step < 0){
				cell.resize(cell.get("size").width-(step), cell.get("size").height);
				edition.updateBoxes(cellView);
			}
		}		
	};
	
	var resizeSelectionOnSoutheast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnSoutheast(edition, evt, graph, cellView);
		});
		Edition.lastEvent = evt;
	};
	
	var resizeOnSoutheast = function(edition, evt, graph, cellView){
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
			edition.updateBoxes(cellView);
		}		
	};

	var resizeSelectionOnNortheast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnNortheast(edition, evt, graph, cellView);
		});
		Edition.lastEvent = evt;
	};
	
	var resizeOnNortheast = function(edition, evt, graph, cellView){		
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
			edition.updateBoxes(cellView);
		}		
	};
	
	var resizeSelectionOnSouthweast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnSouthweast(edition, evt, graph, cellView);
		});
		Edition.lastEvent = evt;
	};
	
	var resizeOnSouthweast = function(edition, evt, graph, cellView){		
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
			edition.updateBoxes(cellView);
		}		
	};

	var resizeSelectionOnNorthweast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnNorthweast(edition, evt, graph, cellView);
		});
		Edition.lastEvent = evt;
	};
	
	var resizeOnNorthweast = function(edition, evt, graph, cellView){	
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
			edition.updateBoxes(cellView);
		}		
	};	
}

//=====================================================
//Right Click Context Menus
//=====================================================

function treeStyleSubMenuActions(key, cellView, graph){
	if(key!=null && key!=""){
		if(key==="manhatan") cellView.model.set('router', { name: 'manhattan' });
		if(key==="metro") cellView.model.set('router', { name: 'metro' });
		if(key==="orthogonal") cellView.model.set('router', { name: 'orthogonal' });
		if(key==="verticaltree") verticalTreeRouter(graph, cellView); 
		if(key==="horizontaltree") horizontalTreeRouter(graph, cellView);
		if(key==="direct") cellView.model.set('vertices',{});
	}
}

function treeStyleSubMenuItems(){
	return {
        "name": "Tree Style", 
        "items": {
		    "direct": {name: "Direct"},
			"verticaltree": {name: "Vertical Tree" }, 
			"horizontaltree": {name: "Horizontal Tree" },
			"orthogonal" : {name: "Orthogonal"}, 
			"manhatan": {name: "Manhatan"}, 
			"metro": {name: "Metro"}
		}	  
    }	
}

function allowRightClickMenus(graph, paper){
	paper.$el.on('contextmenu', function(evt) { 
		evt.stopPropagation(); 
		evt.preventDefault();  
		var cellView = paper.findView(evt.target);
		if (cellView) {		   
		   if(cellView.model instanceof joint.dia.Link){
				$.contextMenu({
					selector: '.contextmenu', 
					events: {  
						 hide:function(){ $.contextMenu( 'destroy' ); }
					},
					callback: $.proxy((function(key, options) {                         
						treeStyleSubMenuActions(key, cellView, graph);
					}).bind(this)),
					items: { 
						"fold1a": treeStyleSubMenuItems()						
					}
				});	
				$('.contextmenu').contextMenu({x: evt.clientX, y: evt.clientY});
		   }
		}
	})	
}

