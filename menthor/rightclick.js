
function RightClickContextMenu(){
	
	this.canvas = null;
	
	this.action = function (evt, key, cellView){		
		if(key!=null && key!=""){
			if(key==="manhatan") cellView.model.set('router', { name: 'manhattan' });
			if(key==="metro") cellView.model.set('router', { name: 'metro' });
			if(key==="orthogonal") cellView.model.set('router', { name: 'orthogonal' });			
			if(key==="verticaltree") verticalTreeRouter(this.canvas.getGraph(), cellView); 
			if(key==="horizontaltree") horizontalTreeRouter(this.canvas.getGraph(), cellView);
			if(key==="direct") cellView.model.set('vertices',{});
			if(key==="linktogenset") this.canvas.dragGenToGenSet(cellView, evt);
		}
	};
	
	this.getItems = function(cellView){
		var items = {}		
		if(cellView.model instanceof joint.shapes.mcore.MGeneralization) items["linktogenset"] = {name: "Gen Set"};
		if(cellView.model instanceof joint.dia.Link) items["treestyle"] = treeStyle();
		return items;		
	};
	
	var treeStyle = function (){
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