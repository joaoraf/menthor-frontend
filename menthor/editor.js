//=====================================================
//Pallete
//=====================================================

function Pallete(){
	
	this.language = "MCore";
	this.graph = null;
	this.paper = null;
	
	this.installOnDiv = function(htmlElemId){		
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
			stereotype: stereotype,
		});
	};
	
	this.enableDndTo = function(canvas){
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
					canvas.getGraph().addCell(elem);
					$("body").unbind("mousemove");
					$("body").unbind("mouseup");			    	
				}
				fake.remove();
			}).bind(this));		
		 }).bind(this));
	};
}

//=====================================================
//Connections Suggestions
//=====================================================

function ConnSuggestions(){
		
	this.language = "MCore"
	this.map = {};
	
	this.defaultConnections = function(){
		this.map = { 'Generalization': 'joint.shapes.mcore.MGeneralization', 'Relationship': 'joint.shapes.mcore.MRelationship'}
	};
	
	this.createConnection = function (connClass, stereotype) {
		return new connClass({stereotype:stereotype});
	};
	
	this.installOn = function(canvas){
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
						var link = this.createConnection(eval(this.map[menuItems[key].name]),(String(key)).toLowerCase())
						dndLink(evt,canvas.getGraph(),canvas.getPaper(),link);											
					}
				}).bind(this)),
				items: menuItems
			});	
			$('.contextmenu').contextMenu({x: xPos, y: yPos});
			
		}).bind(this));	
	};
		
	var dndLink = function(evt, graph, paper, link){
		var cell = graph.getCell(Edition.selection[0].model.get("id"));	
		link.set("source", {
			id: Edition.selection[0].model.get("id")
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
//Selection & Edition
//=====================================================

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
	
	this.installSelection = function(canvas){	
	
		canvas.getPaper().on('cell:pointerclick cell:pointerdblclick', (function(cellView, evt, x, y){
			if(cellView.model instanceof joint.shapes.mcore.MType){
				if (!(evt.ctrlKey || evt.metaKey)) Edition.selection = []; 
				Edition.selection.push(cellView);				
				console.log("Selected: "+cellView);				
				this.updateEditionBox(cellView);									
			}
		}).bind(this));
		
		canvas.getPaper().on('blank:pointerdown', (function(cellView, evt, x, y){
			Edition.selection = [];
			$("#editor").hide();
		}).bind(this));
		
		canvas.getPaper().on('cell:pointermove', (function(cellView, evt, x, y){
			if(cellView.model instanceof joint.shapes.mcore.MType){
				if(Edition.selection.length==0) {
					Edition.selection.push(cellView);
					console.log("Selected: "+cellView);
				}
				this.updateEditionBox(cellView);
			}else{
				$("#editor").hide();
			}
		}).bind(this));	
	};
				
	this.updateEditionBox = function(cell) {
		var currentScale = 1;
		if(cell != null && this.firstSelected()==(cell)){
			$("#editor").css("top", ($("#"+cell.id).offset().top-2+$("#diagram").scrollTop())+"px");
			$("#editor").css("left", ($("#"+cell.id).offset().left-$("#diagram").offset().left-2+$("#diagram").scrollLeft())+"px");		
			$("#editor").width((cell.model.get("size").width+2)*currentScale);
			$("#editor").height((cell.model.get("size").height+2)*currentScale);
			$("#editor").show();	
		}	
	};
	
	this.installDelete = function(canvas){
		$(".delete").mousedown((function(evt){
			evt.preventDefault();
			evt.stopPropagation();				
			removeSelection(canvas.getGraph());			
		}).bind(this));
	};

	this.installDuplicate = function(canvas){
		$(".duplicate").mousedown((function(evt){
			evt.preventDefault();
			evt.stopPropagation();
			duplicateSelection(canvas.getGraph());
		}).bind(this));
	};
	
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
	
	var duplicateSelection = function(graph){
		_.each(Edition.selection, function(element){			
			var newCell = graph.getCell(element.model.get("id")).clone();
			graph.addCell(newCell);
			console.log("Duplicated	: "+newCell)
			newCell.translate(10, 10);
		});
		$("#editor").hide();
	};
		
	var removeSelection= function(graph){
		_.each(Edition.selection, function(element){
			var cell = graph.getCell(element.model.get("id"));
			cell.remove();
			console.log("Deleted: "+cell);
		});
		$("#editor").hide();
	};
	
	var resizeSelectionOnNorth = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnNorth(edition, evt, graph, cellView);
		});
	};
	
	var resizeOnNorth = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var view = $("#"+cellView.id);
			var step = Math.abs(Edition.lastEvent.pageY-evt.pageY) > 10?(Edition.lastEvent.pageY-evt.pageY > 0?10:-10):Edition.lastEvent.pageY-evt.pageY;
			if(cell.get("size").height > 10 || step > 0){
				cell.translate(0, -(step));
				cell.resize(cell.get("size").width, cell.get("size").height+(step));
				edition.updateEditionBox(cellView);
			}
		}
		Edition.lastEvent = evt;
	}
	
	var resizeSelectionOnSouth = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnSouth(edition, evt, graph, cellView);			
		});
	};
	
	var resizeOnSouth = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Edition.lastEvent.pageY-evt.pageY) > 10?(Edition.lastEvent.pageY-evt.pageY > 0?10:-10):Edition.lastEvent.pageY-evt.pageY;
			if(cell.get("size").height > 10 || step < 0){
				cell.resize(cell.get("size").width, cell.get("size").height-(step));				
				edition.updateEditionBox(cellView);
			}
		}
		Edition.lastEvent = evt;
	};
	
	var resizeSelectionOnWeast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnWeast(edition, evt, graph, cellView);
		});
	};
	
	var resizeOnWeast = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Edition.lastEvent.pageX-evt.pageX) > 10?(Edition.lastEvent.pageX-evt.pageX > 0?10:-10):Edition.lastEvent.pageX-evt.pageX;			
			if(cell.get("size").width > 10 || step > 0){
				cell.translate(-(step), 0);
				cell.resize(cell.get("size").width+(step), cell.get("size").height);
				edition.updateEditionBox(cellView);
			}
		}
		Edition.lastEvent = evt;
	};
	
	var resizeSelectionOnEast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnEast(edition, evt, graph, cellView);
		});
	};
	
	var resizeOnEast = function(edition, evt, graph, cellView){
		if(Edition.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Edition.lastEvent.pageX-evt.pageX) > 10?(Edition.lastEvent.pageX-evt.pageX > 0?10:-10):Edition.lastEvent.pageX-evt.pageX;				
			if(cell.get("size").width > 10 || step < 0){
				cell.resize(cell.get("size").width-(step), cell.get("size").height);
				edition.updateEditionBox(cellView);
			}
		}
		Edition.lastEvent = evt;
	};
	
	var resizeSelectionOnSoutheast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnSoutheast(edition, evt, graph, cellView);
		});
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
			edition.updateEditionBox(cellView);
		}
		Edition.lastEvent = evt;
	};

	var resizeSelectionOnNortheast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnNortheast(edition, evt, graph, cellView);
		});
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
			edition.updateEditionBox(cellView);
		}
		Edition.lastEvent = evt;
	};
	
	var resizeSelectionOnSouthweast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnSouthweast(edition, evt, graph, cellView);
		});
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
			edition.updateEditionBox(cellView);
		}
		Edition.lastEvent = evt;
	};

	var resizeSelectionOnNorthweast = function(edition, evt, graph){
		_.each(Edition.selection, function(cellView){
			resizeOnNorthweast(edition, evt, graph, cellView);
		});
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
			edition.updateEditionBox(cellView);
		}
		Edition.lastEvent = evt;
	};	
}

//=====================================================
//Canvas
//=====================================================

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
		   console.log(cellView.model.id);
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

