//=====================================================
//Pallete
//=====================================================

function palleteElements(){
	var kind = createClass(joint.shapes.ontouml.Class,'Kind','kind',10,10);	
	var collective = createClass(joint.shapes.ontouml.Class,'Collective','collective', 110, 10);		
	var quantity = createClass(joint.shapes.ontouml.Class,'Quantity','quantity', 10, 60);					
	var relator = createClass(joint.shapes.ontouml.Class,'Relator','relator', 110, 60);	
	var mode = createClass(joint.shapes.ontouml.Class,'Mode','mode', 10, 110);		
	var quality = createClass(joint.shapes.ontouml.Class,'Quality','quality', 110, 110);			
	var subkind = createClass(joint.shapes.ontouml.Class,'SubKind','subkind', 10, 160 );	
	var role = createClass(joint.shapes.ontouml.Class,'Role','role', 110, 160);		
	var phase = createClass(joint.shapes.ontouml.Class,'Phase','phase',10, 210);		
	var category = createClass(joint.shapes.ontouml.Class,'Category','category', 110, 210);	
	var roleMixin = createClass(joint.shapes.ontouml.Class,'RoleMixin','roleMixin',10, 260);		
	var phaseMixin = createClass(joint.shapes.ontouml.Class,'PhaseMixin','phaseMixin',110, 260);	
	var mixin = createClass(joint.shapes.ontouml.Class,'Mixin','mixin',10, 310);	
	var event = createClass(joint.shapes.ontouml.Class,'Event','event',110, 310);	
	var highorder = createClass(joint.shapes.ontouml.Class,'HighOrder','highorder',10, 360);	
	return [kind, collective, quantity, relator, mode, quality, subkind, role, phase,category, roleMixin, phaseMixin, mixin, event, highorder];
}

function createClass(classe, name, stereotype, x, y) {
	return new classe({
		position: { x: x  , y: y },
		name: name,
		stereotype,
	});
}

function allowDnDOnPallete(pallete){
	pallete.on('cell:pointerdown', function(cellView, evt, x, y){		
		var fake = $("<div class='dnd'><div id='dnd'></div></div>").appendTo("body").css("left", x+"px").css("top", y+"px");		
		var fakeElem = createClass(eval(cellView.model.get("type")), cellView.model.get("name"), cellView.model.get("stereotype"), 0, 0);
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
		$("body").mouseup(function(evt) {
			if(evt.pageX-$("#tools").width()-40 > 0){//if we are on target paper (canvas) we add the new element {
				var elem = createClass(eval(cellView.model.get("type")), cellView.model.get("name"), cellView.model.get("stereotype"), evt.pageX-$("#tools").width()-40, evt.pageY-40);				
				graph.addCell(elem);
				$("body").unbind("mousemove");
				$("body").unbind("mouseup");			    	
			}
			fake.remove();
		});		
	 });
}
 
//=====================================================
//Edition
//=====================================================

allowEditing.lastEvent = null

function allowEditing(graph, paper){
	allowDeletions(graph)
	allowDuplicates(graph)
	allowResizing(graph)
	allowConnecting(graph, paper)
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
//Selection
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
		if(cellView.model instanceof joint.shapes.mcore.MType)
		 	updateEditor(cellView);
	 	else{
		 	$("#editor").hide();
		}
	});	
}

//=====================================================
//Concrete methods themselves
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

function allowConnecting(graph, paper){
	$(".connect").mousedown(function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		var cell = graph.getCell(allowSelecting.selectedElement.model.get("id"));			
		var link = paper.getDefaultLink();		
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
	});	
}

function runningExample(graph){
	var forest = new joint.shapes.ontouml.Class({	
        name: 'Forest',
		stereotype:'collective',
        attributes: ['name: String'],
        position: { x: 100, y: 130 }
    });

	var tree = new joint.shapes.ontouml.Class({	
        name: 'Tree',
		stereotype:'kind',
        position: { x: 400, y: 140 }
    });
	
	var entity = new joint.shapes.ontouml.Class({	
        name: 'Entity',
		stereotype: 'category',       
        position: { x: 380, y: 50 }
    });
	
	var color = new joint.shapes.ontouml.DataType({	
        name: 'Color',
		stereotype: 'quality',       
        position: { x: 530, y: 50 }
    });
	
	var link = new joint.shapes.ontouml.Relationship({
        source: { id: forest.id },
        target: { id: tree.id },
		stereotype: 'memberOf',
    });
	
	var material = new joint.shapes.ontouml.Relationship({
        source: { id: color.id },
        target: { id: tree.id },
		stereotype: 'material',
    });
	//var derivation = material.setTruthMaker(graph, forest.id)
	
    var link2 = new joint.shapes.ontouml.Generalization({
        source: { id: tree.id },
        target: { id: entity.id }
    });
	
	graph.addCells([forest, tree, entity, color, link, link2, material]);
}