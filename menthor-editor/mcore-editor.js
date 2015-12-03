//=====================================================
//Base Pallete
//=====================================================

function Pallete(){
	
	this.language = "MCore";
	this.graph = null;
	this.paper = null;
	
	this.installOn = function(htmlElemId){		
		this.graph = new joint.dia.Graph;
		this.paper = new joint.dia.Paper({
			el: $('#'+htmlElemId),	
			width: $("#"+htmlElemId).width(),
			height: $("#"+htmlElemId).height(),
			gridSize: 1,
			interactive: false,
			model: this.graph
		});	
		this.graph.addCells(this.elements());
	};
	
	this.elements = function(){
		var class_ = this.createElement(joint.shapes.mcore.MClass,'Class',10,10,null);
		var dataType = this.createElement(joint.shapes.mcore.MDataType,'DataType',110, 10, null);	
		return [class_, dataType]
	};
		
	this.createElement = function (class_, name, x, y, stereotype) {
		return new class_({
			position: { x: x  , y: y },
			name: name,
			stereotype,
		});
	};
	
	this.enableDnd = function(diagramGraph){
		this.paper.on('cell:pointerdown', (function(cellView, evt, x, y){		
			var fake = $("<div class='dnd'><div id='dnd'></div></div>").appendTo("body").css("left", x+"px").css("top", y+"px");	
			var fakeElem = this.createElement(eval(cellView.model.get("type")), cellView.model.get("name"), 0, 0, cellView.model.get("stereotype"));
			var fakeGraph = new joint.dia.Graph;
			var fakePaper = new joint.dia.Paper({
				el: $('#dnd'),
				width: fakeElem.getWidth(),
				height: fakeElem.getHeight(),
				gridSize: 1,
				model: fakeGraph
			}); 		
			fakeGraph.addCell(fakeElem);
			$("body").mousemove(function(evt){
				fake.css("left", (evt.pageX-45)+"px").css("top", (evt.pageY-30)+"px");
			});
			$("body").mouseup((function(evt) {
				if(evt.pageX-$("#tools").width()-40 > 0){//if we are on target paper (canvas) we add the new element {
					var elem = this.createElement(eval(cellView.model.get("type")), cellView.model.get("name"), evt.pageX-$("#tools").width()-40, evt.pageY-40, cellView.model.get("stereotype"));				
					diagramGraph.addCell(elem);
					$("body").unbind("mousemove");
					$("body").unbind("mouseup");			    	
				}
				fake.remove();
			}).bind(this));		
		 }).bind(this));
	};
}

//=====================================================
//Base Connections Suggestion
//=====================================================

function ConnSuggestions(){
		
	this.language = "MCore"
	this.map = {};
	
	this.defaultConnections = function(){
		this.map = { 'Generalization': new joint.shapes.mcore.MGeneralization(), 'Relationship': new joint.shapes.mcore.MRelationship()}
	};
	
	this.install = function(diagramGraph, diagramPaper){
		this.defaultConnections();
		$(".connect").mousedown((function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			var xPos = evt.clientX;
			var yPos = evt.clientY;	
			var menuItems = {};
			for(key in this.map){
				var k = (String(key)).toLowerCase()
				menuItems[k] = {name: String(key)}
			}
			$.contextMenu({
				selector: '.contextmenu', 
				events: {  
					 hide:function(){ $.contextMenu( 'destroy' ); }
				},
				callback: $.proxy((function(key, options) {                         
					if(key!=null && key!=""){	
						var link = this.map[menuItems[key].name]
						dndLink(evt,diagramGraph,diagramPaper,link);											
					}
				}).bind(this)),
				items: menuItems
			});	
			$('.contextmenu').contextMenu({x: xPos, y: yPos});
			
		}).bind(this));	
	};
		
	var dndLink = function(evt, graph, paper, link){
		var cell = graph.getCell(allowSelecting.selectedElement.model.get("id"));	
		link.set("source", {
			id: allowSelecting.selectedElement.model.get("id")
		});
		link.set("target", paper.snapToGrid({
			x: evt.clientX,
			y: evt.clientY
		}));			
		graph.addCell(link, {
			validation: false
		});
		var linkView = paper.findViewByModel(link);
		linkView.startArrowheadMove("target");
		$("body").mouseup(function(evt){		
			linkView.pointerup(evt);
			$("body").unbind();
		});
		$("body").mousemove(function(evt){
			var coords = paper.snapToGrid({
				x: evt.clientX,
				y: evt.clientY
			});
			linkView.pointermove(evt, coords.x, coords.y)
		});
		$("#editor").hide();
	};
}

//=====================================================
//Base Edition
//=====================================================

allowEditing.lastEvent = null

function allowEditing(graph, paper){
	allowDeletions(graph)
	allowDuplicates(graph)
	allowResizing(graph)
}

function allowResizing(graph){
	allowResizingNorth(graph)
	allowResizingSouth(graph)
	allowResizingEast(graph)
	allowResizingWeast(graph)
	allowResizingSouthEast(graph)
	allowResizingSouthWeast(graph)
	allowResizingNorthWeast(graph)
	allowResizingNorthEast(graph)
}

function updateEditor(cell) {
	var currentScale = 1;
	if(cell != null){		
		$("#editor").css("top", ($("#"+cell.id).offset().top-2+$("#diagram").scrollTop())+"px");
		$("#editor").css("left", ($("#"+cell.id).offset().left-$("#diagram").offset().left-2+$("#diagram").scrollLeft())+"px");		
		$("#editor").width((cell.model.get("size").width+2)*currentScale);
		$("#editor").height((cell.model.get("size").height+2)*currentScale);
		$("#editor").show();	
	}	
}

//=====================================================
//Base Selection
//=====================================================

//'static' property of selections
allowSelecting.selectedElement = null
	
/** Setup the selection box which envolves the element and allows editions like resizing, connections and etc. */
function allowSelecting(graph, paper){	
	paper.on('cell:pointerclick', function(cellView, evt, x, y){
		if(cellView.model instanceof joint.shapes.mcore.MType){			
			allowSelecting.selectedElement = cellView;			
			console.log("Selected: "+allowSelecting.selectedElement)			
			updateEditor(allowSelecting.selectedElement);
		}		
	});
	paper.on('blank:pointerdown', function(cellView, evt, x, y){
		allowSelecting.selectedElement = null;
		$("#editor").hide();
	});
	paper.on('cell:pointermove', function(cellView, evt, x, y){
		if(cellView.model instanceof joint.shapes.mcore.MType){
			if(allowSelecting.selectedElement==null) {
				allowSelecting.selectedElement = cellView;
				console.log("Selected: "+allowSelecting.selectedElement)
			}
		 	updateEditor(cellView);
	 	}else{
		 	$("#editor").hide();
		}
	});	
}

//=====================================================
//Base methods
//=====================================================

function disallowInteractionsOnLinks(graph, canvas){
	_.each(graph.getLinks(), function(link){
		var linkView = canvas.findViewByModel(link);
		linkView.options.interactive = false;
	});
}

function forbidDroppingLinksOnCanvas(paper){	
	var recordedTgt = null;
	var recordedSrc = null
	paper.on('cell:pointerdown ', function(cellView, evt, x, y) { 
		if(cellView.model.isLink() && cellView.targetView != null){
			recordedTgt = cellView.model.get('target');
		}
		if(cellView.model.isLink() && cellView.sourceView != null){
			recordedSrc = cellView.model.get('source');
		}
	})
	paper.on('cell:pointerup ', function(cellView, evt, x, y) { 
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
	
function allowResizingNorth(graph){
	$(".n").mousedown(function(evt){ 
		evt.preventDefault();
		evt.stopPropagation();
		$("body").mouseup(function(evt){ 
			evt.preventDefault();
			evt.stopPropagation();
			$("body").unbind();
		});
		$("body").mousemove(function(evt) {
			if(allowEditing.lastEvent != null){
				var cell = graph.getCell(allowSelecting.selectedElement.model.get("id"));
				var view = $("#"+allowSelecting.selectedElement.id);
				var step = Math.abs(allowEditing.lastEvent.pageY-evt.pageY) > 10?(allowEditing.lastEvent.pageY-evt.pageY > 0?10:-10):allowEditing.lastEvent.pageY-evt.pageY;
				if(cell.get("size").height > 10 || step > 0){
					cell.translate(0, -(step));
					cell.resize(cell.get("size").width, cell.get("size").height+(step));
					updateEditor(allowSelecting.selectedElement);
				}
			}
			allowEditing.lastEvent = evt;
		});
	});
}

function allowResizingSouth(graph){
	$(".s").mousedown(function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		$("body").mouseup(function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").unbind();
		});
		$("body").mousemove(function(evt) {
			if(allowEditing.lastEvent != null){
				var cell = graph.getCell(allowSelecting.selectedElement.model.get("id"));
				var step = Math.abs(allowEditing.lastEvent.pageY-evt.pageY) > 10?(allowEditing.lastEvent.pageY-evt.pageY > 0?10:-10):allowEditing.lastEvent.pageY-evt.pageY;
				if(cell.get("size").height > 10 || step < 0){
					cell.resize(cell.get("size").width, cell.get("size").height-(step));
					updateEditor(allowSelecting.selectedElement);
				}
			}
			allowEditing.lastEvent = evt;
		});
	});
}

function allowResizingWeast(graph){
	$(".w").mousedown(function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		$("body").mouseup(function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").unbind();
		});
		$("body").mousemove(function(evt){
			if(allowEditing.lastEvent != null){
				var cell = graph.getCell(allowSelecting.selectedElement.model.get("id"));
				var step = Math.abs(allowEditing.lastEvent.pageX-evt.pageX) > 10?(allowEditing.lastEvent.pageX-evt.pageX > 0?10:-10):allowEditing.lastEvent.pageX-evt.pageX;			
				if(cell.get("size").width > 10 || step > 0){
					cell.translate(-(step), 0);
					cell.resize(cell.get("size").width+(step), cell.get("size").height);
					updateEditor(allowSelecting.selectedElement);
				}
			}
			allowEditing.lastEvent = evt;
		});
	});	
}

function allowResizingEast(graph){
	$(".e").mousedown(function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		$("body").mouseup(function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").unbind();
		});
		$("body").mousemove(function(evt){
			if(allowEditing.lastEvent != null){
				var cell = graph.getCell(allowSelecting.selectedElement.model.get("id"));
				var step = Math.abs(allowEditing.lastEvent.pageX-evt.pageX) > 10?(allowEditing.lastEvent.pageX-evt.pageX > 0?10:-10):allowEditing.lastEvent.pageX-evt.pageX;				
				if(cell.get("size").width > 10 || step < 0){
					cell.resize(cell.get("size").width-(step), cell.get("size").height);
					updateEditor(allowSelecting.selectedElement);
				}
			}
			allowEditing.lastEvent = evt;
		});
	});	
}

function allowResizingSouthEast(graph){
	$(".se").mousedown(function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		$("body").mouseup(function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").unbind();
		});
		$("body").mousemove(function(evt){
			if(allowEditing.lastEvent != null){
				var cell = graph.getCell(allowSelecting.selectedElement.model.get("id"));
				var stepX = Math.abs(allowEditing.lastEvent.pageX-evt.pageX) > 10?(allowEditing.lastEvent.pageX-evt.pageX > 0?10:-10):allowEditing.lastEvent.pageX-evt.pageX;
				var stepY = Math.abs(allowEditing.lastEvent.pageY-evt.pageY) > 10?(allowEditing.lastEvent.pageY-evt.pageY > 0?10:-10):allowEditing.lastEvent.pageY-evt.pageY;				
				if(cell.get("size").width > 10 || stepX < 0){
					cell.resize(cell.get("size").width-(stepX), cell.get("size").height);
				}
				if(cell.get("size").height > 10 || stepY < 0){
					cell.resize(cell.get("size").width, cell.get("size").height-(stepY));						
				}
				updateEditor(allowSelecting.selectedElement);
			}
			allowEditing.lastEvent = evt;
		});
	});	
}

function allowResizingSouthWeast(graph){
	$(".sw").mousedown(function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		$("body").mouseup(function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").unbind();
		});
		$("body").mousemove(function(evt){
			if(allowEditing.lastEvent != null){
				var cell = graph.getCell(allowSelecting.selectedElement.model.get("id"));
				var stepX = Math.abs(allowEditing.lastEvent.pageX-evt.pageX) > 10?(allowEditing.lastEvent.pageX-evt.pageX > 0?10:-10):allowEditing.lastEvent.pageX-evt.pageX;
				var stepY = Math.abs(allowEditing.lastEvent.pageY-evt.pageY) > 10?(allowEditing.lastEvent.pageY-evt.pageY > 0?10:-10):allowEditing.lastEvent.pageY-evt.pageY;				
				if(cell.get("size").width > 10 || stepX > 0){
					cell.translate(-stepX, 0);
					cell.resize(cell.get("size").width+stepX, cell.get("size").height);
				}
				if(cell.get("size").height > 10 || stepY < 0){
					cell.resize(cell.get("size").width, cell.get("size").height-stepY);
				}
				updateEditor(allowSelecting.selectedElement);
			}
			allowEditing.lastEvent = evt;
		});
	});
}

function allowResizingNorthWeast(){
	$(".nw").mousedown(function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		$("body").mouseup(function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").unbind();
		});
		$("body").mousemove(function(evt){
			if(allowEditing.lastEvent != null){
				var cell = graph.getCell(allowSelecting.selectedElement.model.get("id"));
				var stepX = Math.abs(allowEditing.lastEvent.pageX-evt.pageX) > 10?(allowEditing.lastEvent.pageX-evt.pageX > 0?10:-10):allowEditing.lastEvent.pageX-evt.pageX;
				var stepY = Math.abs(allowEditing.lastEvent.pageY-evt.pageY) > 10?(allowEditing.lastEvent.pageY-evt.pageY > 0?10:-10):allowEditing.lastEvent.pageY-evt.pageY;				
				if(cell.get("size").width > 10 || stepX > 0){
					cell.translate(-(stepX), 0);
					cell.resize(cell.get("size").width+(stepX), cell.get("size").height);
				}
				if(cell.get("size").height > 10 || stepY > 0){
					cell.translate(0, -(stepY));
					cell.resize(cell.get("size").width, cell.get("size").height+(stepY));
				}
				updateEditor(allowSelecting.selectedElement);
			}
			allowEditing.lastEvent = evt;
		});
	});	
}

function allowResizingNorthEast(graph){
	$(".ne").mousedown(function(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		$("body").mouseup(function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			$("body").unbind();
		});
		$("body").mousemove(function(evt){
			if(allowEditing.lastEvent != null){
				var cell = graph.getCell(allowSelecting.selectedElement.model.get("id"));
				var stepX = Math.abs(allowEditing.lastEvent.pageX-evt.pageX) > 10?(allowEditing.lastEvent.pageX-evt.pageX > 0?10:-10):allowEditing.lastEvent.pageX-evt.pageX;
				var stepY = Math.abs(allowEditing.lastEvent.pageY-evt.pageY) > 10?(allowEditing.lastEvent.pageY-evt.pageY > 0?10:-10):allowEditing.lastEvent.pageY-evt.pageY;				
				if(cell.get("size").width > 10 || stepX < 0){
					cell.resize(cell.get("size").width-(stepX), cell.get("size").height);						
				}					
				if(cell.get("size").height > 10 || stepY > 0){
					cell.translate(0, -(stepY));
					cell.resize(cell.get("size").width, cell.get("size").height+(stepY));
				}
				updateEditor(allowSelecting.selectedElement);
			}
			allowEditing.lastEvent = evt;
		});
	});
}

function allowDeletions(graph){
	$(".delete").mousedown(function(evt){
		evt.preventDefault();
		evt.stopPropagation();	
		console.log("Delete: "+allowSelecting.selectedElement)		
		graph.getCell(allowSelecting.selectedElement.model.get("id")).remove();
		$("#editor").hide();
	});
}

function allowDuplicates(graph){
	$(".duplicate").mousedown(function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		console.log("Duplicate	: "+allowSelecting.selectedElement)
		var newCell = graph.getCell(allowSelecting.selectedElement.model.get("id")).clone();
		graph.addCell(newCell);
		newCell.translate(10, 10);
		$("#editor").hide();
	});
}	

//=====================================================
//Right Click Context Menus
//=====================================================

function allowRightClickMenus(graph, paper){
	paper.$el.on('contextmenu', function(evt) { 
		evt.stopPropagation(); // Stop bubbling so that the paper does not handle mousedown.
		evt.preventDefault();  // Prevent displaying default browser context menu.
		var cellView = canvas.findView(evt.target);
		if (cellView) {
		   // The context menu was brought up when clicking a cell view in the paper.
		   console.log(cellView.model.id);  // So now you have access to both the cell view and its model.
		   if(cellView.model instanceof joint.dia.Link){
				//context menu for line style
		   }
		}
	})	
}

