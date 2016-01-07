
function RightClickContextMenu(){
		
	/** language used on this pallete by default */
	this.language = "MCore"
	
	/** execute an action according to the menu item clicked */
	this.action = function (evt, menukey, contextView, canvas){		
		if(menukey==null || menukey==="") return;		
		if(menukey==="linktogenset") canvas.dragGSLink(contextView, evt);			
		if(menukey==="direct") canvas.getEditor().directRouter(contextView);		
		if(menukey==="verticaltree") canvas.getEditor().verticalTreeRouter(contextView); 		
		if(menukey==="horizontaltree") canvas.getEditor().horizontalTreeRouter(contextView);	
		if(menukey==="leftsquare") canvas.getEditor().leftSquareRouter(contextView);	
		if(menukey==="rightsquare") canvas.getEditor().rightSquareRouter(contextView);			
		if(menukey==="bottom") canvas.getEditor().alignSelectedAtBottom();
		if(menukey==="top") canvas.getEditor().alignSelectedAtTop();
		if(menukey==="left") canvas.getEditor().alignSelectedAtLeft();
		if(menukey==="right") canvas.getEditor().alignSelectedAtRight();
		if(menukey==="centerhorizontally") canvas.getEditor().alignSelectedOnCenterHorizontally();
		if(menukey==="centervertically") canvas.getEditor().alignSelectedOnCenterVertically();	
		if(menukey==="rename") canvas.getEditor().renameWithUpdate(contextView.model);	
	};
	
	/** items of the context menu according to the seleccted cell view */
	this.items = function(cellView){
		var map = {}		
		if(cellView.model instanceof joint.shapes.mcore.MGeneralization) map["linktogenset"] = {name: "Generalization Set"};
		if(cellView.model instanceof joint.dia.Link) map["treestyle"] = treestyle();
		if(cellView.model instanceof joint.shapes.mcore.MType) map["alignments"] = alignments();
		if(!(cellView.model instanceof joint.shapes.mcore.MGeneralization)) map["rename"] = {name: "Rename" };
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
				"leftsquare": {name: "Left Square"},
				"rightsquare": {name: "Right Square"},				
			}	  
		}	
	};	
}