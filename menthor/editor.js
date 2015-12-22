
/** last event registred */
Editor.lastEvent = null;

/** selected elements (joint views) */
Editor.selection = [];

function Editor(){
	
	/** the canvas attached to this Editor */
	this.canvas = null;
	
	/** connection context menu */
	this.connectMenu = new ConnectContextMenu();
	
	/** right click context menu */
	this.rightClickMenu = new RightClickContextMenu();
	
	/** install editing and selection capabilities to a canvas */
	this.install = function (canvas){
		this.canvas = canvas;			
		this.installEditingFeatures();
		this.installSelectionFeatures();
		this.installRightClickMenu();
	};
	
	/** install right click context menu */
	this.installRightClickMenu = function(){
		this.canvas.getPaper().$el.on('contextmenu', (function(evt) { 
			evt.stopPropagation(); 
			evt.preventDefault();  
			var cellView = this.canvas.getPaper().findView(evt.target);
			if (cellView){
				var map = this.rightClickMenu.items(cellView);
				if(_.isEmpty(map)) { return; }
				$.contextMenu({
					selector: '.contextmenu', 
					events: { hide:function(){ $.contextMenu( 'destroy' ); } },
					callback: $.proxy((function(key, options) { this.rightClickMenu.action(evt, key, cellView, this.canvas); }).bind(this)),
					items: map,
				});	
				$('.contextmenu').contextMenu({x: evt.clientX, y: evt.clientY});
			}
		}).bind(this));
	};
	
	/** install editing features */
	this.installEditingFeatures = function(){
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
				"<div class=\"tools delete\"></div>"+
				"<div class=\"tools duplicate\"></div>"+
				"<div class=\"tools connect\"></div>"+			
			"</div>"
		);
		this.canvas.parent().append(editor);	
		this.installDelete();
		this.installConnect();
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
	
	/** install a selection wrapper box for each diagram which envolves a number of single selections */
	this.installSelectionFeatures = function(){		
		var selectionWrapperBox = $("<div id=\"selection-wrapper\"> </div>");		
		this.canvas.parent().append(selectionWrapperBox);		
		this.canvas.getPaper().on('cell:pointerdown', (function(cellView, evt, x, y){						
			Editor.lastEvent = evt;
		}).bind(this));				
		this.canvas.getPaper().on('cell:pointerclick', (function(cellView, evt, x, y){						
			this.clickOnCell(cellView, evt);
			Editor.lastEvent = evt;
		}).bind(this));					
		this.canvas.getPaper().on('cell:pointermove', (function(cellView, evt, x, y){			
			if(Editor.lastEvent.type==="mousedown") this.clickOnCell(cellView, evt);
			this.moveCell(cellView, evt);
			Editor.lastEvent = evt;		
		}).bind(this));	
		this.canvas.getPaper().on('cell:pointerdblclick', (function(cellView, evt, x, y){			
			Editor.lastEvent = evt;
		}).bind(this));		
		this.canvas.getPaper().on('blank:pointerdown', (function(cellView, evt, x, y){
			this.clickOnPaper(x,y);
			Editor.lastEvent = evt;					
		}).bind(this));		
		return selectionWrapperBox;		
	};
	
	this.clickOnPaper = function(x,y){
		this.deselectAll();
	};
	
	this.clickOnCell = function(cellView, evt){
		if(this.canSelect(cellView)){	
			if (evt.ctrlKey || evt.metaKey) {
				if(this.isSelected(cellView)) this.deselect(cellView);
				else this.select(cellView)
			}else{
				this.deselectOthers(cellView);
				if(!this.isSelected()) this.select(cellView);
			}				
		}		
	};
		
	this.moveCell = function(cellView, evt){
		if(this.canSelect(cellView)) {
			this.updateCellBoxes(cellView);
			_.each(this.selected(), (function(cellSelected){
				if(cellSelected!=cellView){					
					var dx = evt.clientX - Editor.lastEvent.clientX;					
					var dy = evt.clientY - Editor.lastEvent.clientY;
					var cell = this.canvas.getGraph().getCell(cellSelected.model.get("id"));					
					cell.translate(dx, dy);				
					this.updateCellBoxes(cellSelected);
				}						
			}).bind(this));
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
	
	/** create a single selection box dynamically according to a user click on a cell */
	this.createCellSelectionBox = function(cell){
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
	this.createCellSelectionBoxes = function(){
		_.each(this.selected(), (function(selected){
			this.createCellSelectionBox(selected);
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
	
	//=============================================================
	
	/** the selected elements */
	this.selected = function() { return Editor.selection; };
	
	/** the first element selected */
	this.firstSelected = function(){ return this.selected()[0]; };
	
	/** the last element selected */
	this.lastSelected = function(){ return this.selected()[this.selected().length-1]; };
	
	/** deselect all elements */
	this.deselectAll = function(){ this.destroyBoxes(); Editor.selection = []; };
	
	/** deselect all elements except the given one */
	this.deselectOthers = function(cellView){
		_.each(this.selected(), (function(selected){	
			if(selected != cellView) this.deselect(selected);
		}).bind(this));
	}
	
	/** select all elements */
	this.selectAll = function(){
		var elems = this.canvas.getGraph().getElements();
		_.each(elems, (function(elem){
			var cellView = this.canvas.getPaper().findViewByModel(elem);
			if(!this.isSelected(cellView)) this.select(cellView);
		}).bind(this));
	};
	
	/** delete selected elements */
	this.deleteSelected = function(){
		_.each(this.selected(), (function(selected){						
			this.deleteCell(selected);				
		}).bind(this));
		this.deselectAll();
	};
	
	/** duplicate selected elements */
	this.duplicateSelected = function(){		
		var newSelected = []
		if(this.canvas==null) return;
		_.each(this.selected(), (function(selected){						
			var newCell = this.canvas.getGraph().getCell(selected.model.get("id")).clone();
			this.canvas.getGraph().addCell(newCell);						
			newCell.translate(20, 20);
			var cellView = this.canvas.getPaper().findViewByModel(newCell);
			newSelected.push(cellView);
		}).bind(this));
		this.deselectAll();
		pushAll(Editor.selection, newSelected);
		this.createCellSelectionBoxes();
		this.updateBoxes();
	};
	
	/** connect selected elements */
	this.connectSelected = function(evt){
		var xPos = evt.clientX;
		var yPos = evt.clientY;	
		var menuItems = this.connectMenu.items();
		$.contextMenu({
			selector: '.contextmenu', 
			events: { hide:function(){ $.contextMenu( 'destroy' ); } },
			callback: $.proxy((function(menukey, options) {                         
				var links = this.connectMenu.createConnections(menukey, this.selected().length);
				var idx = 0;
				_.each(links, (function(link){
					this.canvas.dragLinkFrom(evt, link, this.selected()[idx]);
					idx++;
				}).bind(this));
			}).bind(this)),
			items: menuItems
		});	
		$('.contextmenu').contextMenu({x: xPos, y: yPos});
	};
		
	/** deselect a particular element view */
	this.deselect = function(cellView){		
		if(this.isSelected(cellView)) {
			this.destroyCellBoxes(cellView);
			remove(this.selected(), cellView);
		}	
	};
	
	/** delete a particular element/link view */
	this.deleteCell = function(cellView){			
		/** delete the genset-dashed link if the generalization is deleted */
		var links = this.canvas.getGraph().getConnectedLinks(cellView.model);
		if(cellView.model instanceof joint.dia.Link) links.push(cellView.model);
		_.each(links, (function(link){			
			if(link instanceof joint.shapes.mcore.MGeneralization){							
				if(!_.isEmpty(link.get('link'))){
					var gensetLinkView = this.canvas.getPaper().findViewByModel(link.get('link'));
					this.canvas.getGraph().getCell(gensetLinkView.model.get("id")).remove();										
				}				
			}
		}).bind(this));		
		this.canvas.getGraph().getCell(cellView.model.get("id")).remove();
	};
	
	/** check is an element view is selected */
	this.isSelected = function(cellView){
		if($.inArray(cellView, this.selected())<0) return false;
		else return true;
	};
	
	/** select an element view */
	this.select = function(cellView){
		if(!this.isSelected(cellView)) {
			Editor.selection.push(cellView);				
			this.createCellSelectionBox(cellView);
			this.updateCellBoxes(cellView); 
		}
	};
	
	/** check if we can select an element view */
	this.canSelect = function(cellView){
		return cellView.model instanceof joint.shapes.mcore.MType || cellView.model instanceof joint.shapes.mcore.MGeneralizationSet;
	};
	
	/** align selected elements at bottom */	
	this.alignSelectedAtBottom = function(){		
		var bottom = this.selectedAtBottom();		
		if(bottom!=null){			
			var bottomY2 = endPoint(bottom.model).y;
			_.each(this.selected(), (function(selected){					
				var height = selected.model.get('size').height;
				if(selected != bottom){					
					selected.model.set('position', { x: startPoint(selected.model).x, y: bottomY2-height});	
					this.updateCellBoxes(selected);
				}
			}).bind(this));			
		}		
	};
	
	/** align selected elements at left */
	this.alignSelectedAtLeft = function(){
		var left = this.selectedAtLeft();
		if(left!=null){
			var leftX1 = startPoint(left.model).x;
			_.each(this.selected(), (function(selected){				
				if(selected != left){
					selected.model.set('position', {x : leftX1	, y: startPoint(selected.model).y});
					this.updateCellBoxes(selected);
				}
			}).bind(this));
		}		
	}
	
	/** align selected elements at right */
	this.alignSelectedAtRight = function(){		
		var right = this.selectedAtRight();		
		if(right!=null){
			var rightX2 = endPoint(right.model).x;
			_.each(this.selected(), (function(selected){								
				if(selected != right){
					var width = selected.model.get('size').width;					
					selected.model.set('position', {x: rightX2-width, y: startPoint(selected.model).y});
					this.updateCellBoxes(selected);
				}
			}).bind(this));
		}		
	}
	
	/** align selected elements on top */
	this.alignSelectedAtTop = function(){
		var top = this.selectedAtTop();
		if(top!=null){
			var topY1 = startPoint(top.model).y;
			_.each(this.selected(), (function(selected){				
				if(selected != top){
					selected.model.set('position', {x: startPoint(selected.model).x, y: topY1});
					this.updateCellBoxes(selected);
				}
			}).bind(this));			
		}
	}	
	
	/** the element selected at bottom*/
	this.selectedAtBottom = function(){
		var maxY2 = 0;
		var bottom = null;
		_.each(this.selected(), function(selected){			
			if(endPoint(selected.model).y > maxY2) {
				maxY2 = endPoint(selected.model).y;
				bottom = selected;				
			}
		});
		return bottom;
	};
		
	/** align selected elements on center horizontally */
	this.alignSelectedOnCenterHorizontally = function(){
		if(this.selected().length<=0) return;
		var coordinatesY = []
		_.each(this.selected(), function(selected){
			coordinatesY.push(centerPoint(selected.model).y);
		});			
		var finalpos = this.centerAlignPosition(coordinatesY);
		var largest = this.selectedWithLargestHeight();			
		if(finalpos!=-1 && largest !=null){		
			var largestHeight = largest.model.get('size').height;
			largest.model.set('position', {x: startPoint(largest.model).x, y: finalpos-(largestHeight/2)});
			this.updateCellBoxes(largest);
			_.each(this.selected(), (function(selected){			
				var height = selected.model.get('size').height;
				if(selected != largest){
					selected.model.set('position', {x: startPoint(selected.model).x, y: finalpos-(height/2)});
					this.updateCellBoxes(selected);
				}	
			}).bind(this));
		}
	}
		
	/** align selected elements on center vertically */
	this.alignSelectedOnCenterVertically = function(){
		if(this.selected().length<=0) return;
		var coordinatesX = []
		_.each(this.selected(), function(selected){
			coordinatesX.push(centerPoint(selected.model).x);
		});	
		var finalpos = this.centerAlignPosition(coordinatesX);
		var largest = this.selectedWithLargestWidth();			
		if(finalpos!=-1 && largest !=null){		
			var largestWidth = largest.model.get('size').width;
			largest.model.set('position', {x: finalpos-(largestWidth/2), y: startPoint(largest.model).y});
			this.updateCellBoxes(largest);								
			_.each(this.selected(), (function(selected){			
				var width = selected.model.get('size').width;
				if(selected != largest){
					selected.model.set('position', {x: finalpos-(width/2), y: startPoint(selected.model).y});
					this.updateCellBoxes(selected);
				}	
			}).bind(this));						
		}
	}
	
	/** selected element with the largest height */
	this.selectedWithLargestHeight = function(){
		var maxheight = 0;
		var largest = null;
		_.each(this.selected(), function(selected){
			if(selected.model.get('size').height > maxheight){
				maxheight = selected.model.get('size').height;
				largest = selected;				
			}
		});				
		return largest;
	}
	
	/** selected element with the largest width */
	this.selectedWithLargestWidth = function(){
		var maxwidth = 0;
		var largest = null;
		_.each(this.selected(), function(selected){
			if(selected.model.get('size').width > maxwidth) {
				maxwidth = selected.model.get('size').width;
				largest = selected;				
			}
		});
		return largest;
	}
	
	
	/** algorithm to calculate the center alignment position */
	this.centerAlignPosition = function(coordinates){
		var coordinates = sortNumericalArray(coordinates);
		var size = coordinates.length;
		var offset = 1000;
		var finalpos = -1;			
		if(coordinates.length>0 && coordinates[0]==coordinates[size-1]) return finalpos;			
		for(var i =size-1; i>=0;i--){
			for(var j=i-1; j>=0;j--){
				var diff = coordinates[i]-coordinates[j];
				if(diff<offset) { finalpos = coordinates[j]+(diff/2); offset = diff; }
			}
		}
		return finalpos;
	}
	
	/** the element selected at left*/
	this.selectedAtLeft = function(){
		var maxX1 = this.canvas.getPaper().options.width;
		var left = null;
		_.each(this.selected(), function(selected){
			if(startPoint(selected.model).x < maxX1) {
				maxX1 = startPoint(selected.model).x;
				left = selected;				
			}
		});
		return left;
	};
	
	/** the element selected at right*/
	this.selectedAtRight = function(){
		var maxX2 = 0;
		var right = null;
		_.each(this.selected(), function(selected){
			if(endPoint(selected.model).x > maxX2) {
				maxX2 = endPoint(selected.model).x;
				right = selected;				
			}
		});
		return right;
	};
	
	/** the element selected at top*/
	this.selectedAtTop = function(){
		var maxY1 = this.canvas.getPaper().options.height;		
		var top = null;
		_.each(this.selected(), function(selected){
			if(startPoint(selected.model).y < maxY1){
				maxY1 = startPoint(selected.model).y;
				top = selected;			
			}
		});
		return top;
	};
	
	/** vertical tree style on a line */
	this.verticalTreeRouter = function(linkView){
		var link = linkView.model;
		var node1 = this.canvas.getGraph().getCell(link.get('source').id);
		var node2 = this.canvas.getGraph().getCell(link.get('target').id);
		var direction = getDirectionFromTo(node1, node2);
		if(direction=='S_N' || direction=='SE_NW' || direction=='SW_NE') {	    
			link.set('vertices',[]);		
			linkView.addVertex({x:centerPoint(node2).x, y: endPoint(node2).y+30});
			linkView.addVertex({x:centerPoint(node1).x, y: endPoint(node2).y+30});		
			linkView.update();		
		}else if (direction=='N_S'||direction=='NW_SE'||direction=='NE_SW'){
			link.set('vertices',[]);		
			linkView.addVertex({x:centerPoint(node2).x, y: startPoint(node2).y-30});
			linkView.addVertex({x:centerPoint(node1).x, y: startPoint(node2).y-30});		
			linkView.update();		
		}else{
			link.set('vertices',{});
			return;
		}	  
		node1.on('add change:position', function() { 
			_.first(link.get('vertices')).x = centerPoint(node1).x;
		}, this);
		node2.on('add change:position', function() { 
			_.last(link.get('vertices')).x = centerPoint(node2).x;
		}, this);
	}

	/** horizontal tree style on a line */
	this.horizontalTreeRouter = function(linkView){
		var link = linkView.model;
		var node1 = this.canvas.getGraph().getCell(link.get('source').id);
		var node2 = this.canvas.getGraph().getCell(link.get('target').id);	
		var direction = getDirectionFromTo(node1, node2);
		if(direction=='E_W' || direction=='SE_NW' || direction=='NE_SW') {	    
			link.set('vertices',[]);				
			linkView.addVertex({x:endPoint(node2).x+30, y: centerPoint(node2).y});		
			linkView.addVertex({x:endPoint(node2).x+30, y: centerPoint(node1).y});
			linkView.update();		
		}else if (direction=='W_E'||direction=='NW_SE'||direction=='SW_NE'){
			link.set('vertices',[]);				
			linkView.addVertex({x:startPoint(node2).x-30, y: centerPoint(node2).y});		
			linkView.addVertex({x:startPoint(node2).x-30, y: centerPoint(node1).y});
			linkView.update();		
		}else{
			link.set('vertices',{});
			return;		
		}	  
		node1.on('add change:position', function() { 
			_.first(link.get('vertices')).y = centerPoint(node1).y;
		}, this);
		node2.on('add change:position', function() { 
			_.last(link.get('vertices')).y = centerPoint(node2).y;
		}, this);
	}

	//============================================================================
	
	this.installDelete = function(){
		$(".delete").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation(); this.deleteSelected(); }).bind(this));
		$('.tool-remove').mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation(); 
			var cellView = this.canvas.getPaper().findView(evt.target);			
			this.deleteCell(cellView); 
		}).bind(this));
	};
	
	this.installDuplicate = function(){
		$(".duplicate").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation(); this.duplicateSelected(); }).bind(this));
	};
	
	this.installConnect = function(){
		$(".connect").mousedown((function(evt){ evt.preventDefault(); evt.stopPropagation(); this.connectSelected(evt); }).bind(this));
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
	
	var resizeN = function(Editor, evt, graph){
		_.each(Editor.selected(), function(cellView){ resizeCellN(Editor, evt, graph, cellView); });
		Editor.lastEvent = evt;
	};
	
	var resizeS = function(Editor, evt, graph){ 
		_.each(Editor.selected(), function(cellView){ resizeCellS(Editor, evt, graph, cellView); });
		Editor.lastEvent = evt;
	};
	
	var resizeE = function(Editor, evt, graph){
		_.each(Editor.selected(), function(cellView){ resizeCellE(Editor, evt, graph, cellView); });
		Editor.lastEvent = evt;
	};
	
	var resizeSE = function(Editor, evt, graph){
		_.each(Editor.selected(), function(cellView){ resizeCellSE(Editor, evt, graph, cellView); });
		Editor.lastEvent = evt;
	};
	
	var resizeNE = function(Editor, evt, graph){
		_.each(Editor.selected(), function(cellView){ resizeCellNE(Editor, evt, graph, cellView); });
		Editor.lastEvent = evt;
	};
	
	var resizeSW = function(Editor, evt, graph){
		_.each(Editor.selected(), function(cellView){ resizeOnSouthweast(Editor, evt, graph, cellView); });
		Editor.lastEvent = evt;
	};
	
	var resizeNW = function(Editor, evt, graph){
		_.each(Editor.selected(), function(cellView){ resizeCellNW(Editor, evt, graph, cellView); });
		Editor.lastEvent = evt;
	};
	
	var resizeW = function(Editor, evt, graph){
		_.each(Editor.selected(), function(cellView){ resizeCellW(Editor, evt, graph, cellView); });
		Editor.lastEvent = evt;
	};
	
	var resizeCellN = function(Editor, evt, graph, cellView){
		if(Editor.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var view = $("#"+cellView.id);
			var step = Math.abs(Editor.lastEvent.pageY-evt.pageY) > 10?(Editor.lastEvent.pageY-evt.pageY > 0?10:-10):Editor.lastEvent.pageY-evt.pageY;
			if(cell.get("size").height > 10 || step > 0){
				cell.translate(0, -(step));
				cell.resize(cell.get("size").width, cell.get("size").height+(step));
				Editor.updateCellBoxes(cellView);
			}
		}		
	}
	
	var resizeCellS = function(Editor, evt, graph, cellView){
		if(Editor.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Editor.lastEvent.pageY-evt.pageY) > 10?(Editor.lastEvent.pageY-evt.pageY > 0?10:-10):Editor.lastEvent.pageY-evt.pageY;
			if(cell.get("size").height > 10 || step < 0){
				cell.resize(cell.get("size").width, cell.get("size").height-(step));				
				Editor.updateCellBoxes(cellView);
			}
		}		
	};
		
	var resizeCellW = function(Editor, evt, graph, cellView){
		if(Editor.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Editor.lastEvent.pageX-evt.pageX) > 10?(Editor.lastEvent.pageX-evt.pageX > 0?10:-10):Editor.lastEvent.pageX-evt.pageX;			
			if(cell.get("size").width > 10 || step > 0){
				cell.translate(-(step), 0);
				cell.resize(cell.get("size").width+(step), cell.get("size").height);
				Editor.updateCellBoxes(cellView);
			}
		}		
	};
	
	var resizeCellE = function(Editor, evt, graph, cellView){
		if(Editor.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var step = Math.abs(Editor.lastEvent.pageX-evt.pageX) > 10?(Editor.lastEvent.pageX-evt.pageX > 0?10:-10):Editor.lastEvent.pageX-evt.pageX;				
			if(cell.get("size").width > 10 || step < 0){
				cell.resize(cell.get("size").width-(step), cell.get("size").height);
				Editor.updateCellBoxes(cellView);
			}
		}		
	};
		
	var resizeCellSE = function(Editor, evt, graph, cellView){
		if(Editor.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var stepX = Math.abs(Editor.lastEvent.pageX-evt.pageX) > 10?(Editor.lastEvent.pageX-evt.pageX > 0?10:-10):Editor.lastEvent.pageX-evt.pageX;
			var stepY = Math.abs(Editor.lastEvent.pageY-evt.pageY) > 10?(Editor.lastEvent.pageY-evt.pageY > 0?10:-10):Editor.lastEvent.pageY-evt.pageY;				
			if(cell.get("size").width > 10 || stepX < 0){
				cell.resize(cell.get("size").width-(stepX), cell.get("size").height);
			}
			if(cell.get("size").height > 10 || stepY < 0){
				cell.resize(cell.get("size").width, cell.get("size").height-(stepY));						
			}
			Editor.updateCellBoxes(cellView);
		}		
	};

	var resizeCellNE = function(Editor, evt, graph, cellView){		
		if(Editor.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var stepX = Math.abs(Editor.lastEvent.pageX-evt.pageX) > 10?(Editor.lastEvent.pageX-evt.pageX > 0?10:-10):Editor.lastEvent.pageX-evt.pageX;
			var stepY = Math.abs(Editor.lastEvent.pageY-evt.pageY) > 10?(Editor.lastEvent.pageY-evt.pageY > 0?10:-10):Editor.lastEvent.pageY-evt.pageY;				
			if(cell.get("size").width > 10 || stepX < 0){
				cell.resize(cell.get("size").width-(stepX), cell.get("size").height);						
			}					
			if(cell.get("size").height > 10 || stepY > 0){
				cell.translate(0, -(stepY));
				cell.resize(cell.get("size").width, cell.get("size").height+(stepY));
			}
			Editor.updateCellBoxes(cellView);
		}		
	};
	
	var resizeCellSW = function(Editor, evt, graph, cellView){		
		if(Editor.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var stepX = Math.abs(Editor.lastEvent.pageX-evt.pageX) > 10?(Editor.lastEvent.pageX-evt.pageX > 0?10:-10):Editor.lastEvent.pageX-evt.pageX;
			var stepY = Math.abs(Editor.lastEvent.pageY-evt.pageY) > 10?(Editor.lastEvent.pageY-evt.pageY > 0?10:-10):Editor.lastEvent.pageY-evt.pageY;				
			if(cell.get("size").width > 10 || stepX > 0){
				cell.translate(-stepX, 0);
				cell.resize(cell.get("size").width+stepX, cell.get("size").height);
			}
			if(cell.get("size").height > 10 || stepY < 0){
				cell.resize(cell.get("size").width, cell.get("size").height-stepY);
			}
			Editor.updateCellBoxes(cellView);
		}		
	};
	
	var resizeCellNW = function(Editor, evt, graph, cellView){	
		if(Editor.lastEvent != null){
			var cell = graph.getCell(cellView.model.get("id"));
			var stepX = Math.abs(Editor.lastEvent.pageX-evt.pageX) > 10?(Editor.lastEvent.pageX-evt.pageX > 0?10:-10):Editor.lastEvent.pageX-evt.pageX;
			var stepY = Math.abs(Editor.lastEvent.pageY-evt.pageY) > 10?(Editor.lastEvent.pageY-evt.pageY > 0?10:-10):Editor.lastEvent.pageY-evt.pageY;				
			if(cell.get("size").width > 10 || stepX > 0){
				cell.translate(-(stepX), 0);
				cell.resize(cell.get("size").width+(stepX), cell.get("size").height);
			}
			if(cell.get("size").height > 10 || stepY > 0){
				cell.translate(0, -(stepY));
				cell.resize(cell.get("size").width, cell.get("size").height+(stepY));
			}
			Editor.updateCellBoxes(cellView);
		}		
	};		
}