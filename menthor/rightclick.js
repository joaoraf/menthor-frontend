
function RightClickContextMenu(){
	
	this.canvas = null;
	
	this.action = function (evt, key, cellView){		
		if(key!=null && key!=""){
			if(key==="direct") cellView.model.set('vertices',{});
			if(key==="manhatan") cellView.model.set('router', { name: 'manhattan' });
			if(key==="metro") cellView.model.set('router', { name: 'metro' });
			if(key==="orthogonal") cellView.model.set('router', { name: 'orthogonal' });						
			if(key==="linktogenset") this.canvas.dragGenToGenSet(cellView, evt);			
			if(key==="verticaltree") this.canvas.getEditor().verticalTreeRouter(cellView); 
			if(key==="horizontaltree") this.canvas.getEditor().horizontalTreeRouter(cellView);						
			if(key==="bottom") this.canvas.getEditor().alignSelectedAtBottom();
			if(key==="top") this.canvas.getEditor().alignSelectedAtTop();
			if(key==="left") this.canvas.getEditor().alignSelectedAtLeft();
			if(key==="right") this.canvas.getEditor().alignSelectedAtRight();
			if(key==="centerhorizontally") this.canvas.getEditor().alignSelectedOnCenterHorizontally();
			if(key==="centervertically") this.canvas.getEditor().alignSelectedOnCenterVertically();
		}
	};
	
	this.getItems = function(cellView){
		var items = {}		
		if(cellView.model instanceof joint.shapes.mcore.MGeneralization) items["linktogenset"] = {name: "Generalization Set"};
		if(cellView.model instanceof joint.dia.Link) items["treestyle"] = treestyle();
		if(cellView.model instanceof joint.shapes.mcore.MType) items["alignments"] = alignments();
		return items;		
	};
	
	var alignments = function(){
		return {
			"name": "Alignments",
			"items": {
				"bottom": {name: "Bottom" },
				"top": {name: "Top" },
				"left": {name: "Left" },
				"right": {name: "Right" },
				"centerhorizontally": {name: "Center Horizontally" },
				"centervertically": { name: "Center Vertically "},
			}
		}
	};
	
	var treestyle = function (){
		return {
			"name": "Line Style", 
			"items": {
				"direct": {name: "Direct"},
				"verticaltree": {name: "Vertical Tree" }, 
				"horizontaltree": {name: "Horizontal Tree" },				
				"orthogonal" : {name: "Orthogonal"}, 
				"manhatan": {name: "Manhatan"}, 
				"metro": {name: "Metro"}
			}	  
		}	
	};
		
	this.installOn = function ($contextMenuId, canvas){
		this.canvas = canvas;
		this.canvas.getPaper().$el.on('contextmenu', (function(evt) { 
			evt.stopPropagation(); 
			evt.preventDefault();  
			var cellView = this.canvas.getPaper().findView(evt.target);
			if (cellView) {
				var map = this.getItems(cellView);
				if(_.isEmpty(map)) { return; }
				$.contextMenu({
					selector: '.'+$contextMenuId, 
					events: { hide:function(){ $.contextMenu( 'destroy' ); } },
					callback: $.proxy((function(key, options) { this.action(evt, key, cellView); }).bind(this)),
					items: map,
				});	
				$('.'+$contextMenuId).contextMenu({x: evt.clientX, y: evt.clientY});
			}
		}).bind(this));
	}
}