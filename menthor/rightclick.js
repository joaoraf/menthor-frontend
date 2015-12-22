
function RightClickContextMenu(){
		
	/** language used on this pallete by default */
	this.language = "MCore"
	
	/** execute an action according to the menu item clicked */
	this.action = function (evt, menukey, contextView){		
		if(menukey==null || menukey==="") return;
		if(menukey==="direct") contextView.model.set('vertices',{});
		if(menukey==="manhatan") contextView.model.set('router', { name: 'manhattan' });
		if(menukey==="metro") contextView.model.set('router', { name: 'metro' });
		if(menukey==="orthogonal") contextView.model.set('router', { name: 'orthogonal' });						
		if(menukey==="linktogenset") this.canvas.dragGenToGenSet(contextView, evt);			
		if(menukey==="verticaltree") this.canvas.getEditor().verticalTreeRouter(contextView); 
		if(menukey==="horizontaltree") this.canvas.getEditor().horizontalTreeRouter(contextView);						
		if(menukey==="bottom") this.canvas.getEditor().alignSelectedAtBottom();
		if(menukey==="top") this.canvas.getEditor().alignSelectedAtTop();
		if(menukey==="left") this.canvas.getEditor().alignSelectedAtLeft();
		if(menukey==="right") this.canvas.getEditor().alignSelectedAtRight();
		if(menukey==="centerhorizontally") this.canvas.getEditor().alignSelectedOnCenterHorizontally();
		if(menukey==="centervertically") this.canvas.getEditor().alignSelectedOnCenterVertically();		
	};
	
	/** items of the context menu according to the seleccted cell view */
	this.items = function(cellView){
		var map = {}		
		if(cellView.model instanceof joint.shapes.mcore.MGeneralization) map["linktogenset"] = {name: "Generalization Set"};
		if(cellView.model instanceof joint.dia.Link) map["treestyle"] = treestyle();
		if(cellView.model instanceof joint.shapes.mcore.MType) map["alignments"] = alignments();
		return map;		
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
}