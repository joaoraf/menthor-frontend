
function ConnectContextMenu(){
		
	this.language = "MCore"
	this.map = {};
	this.canvas = null;
	
	this.defaultConnections = function(){
		this.map = { 'Generalization': 'joint.shapes.mcore.MGeneralization', 'Relationship': 'joint.shapes.mcore.MRelationship'}
	};
	
	this.createConnections = function (connClass, stereotype) {
		var conns = []
		_.each(Edition.selection, function(selected){
			conns.push(new connClass({stereotype:stereotype}));
		});
		return conns
	};
	
	this.setCanvas = function(canvas){
		this.canvas = canvas;
	};
	
	this.getCanvas = function(){
		return this.canvas;
	};
	
	this.installOnDivs = function($connectId, $contextMenuId){
		this.defaultConnections();
		$("."+$connectId).mousedown((function(evt){
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
				selector: '.'+$contextMenuId, 
				events: {  
					 hide:function(){ $.contextMenu( 'destroy' ); }
				},
				callback: $.proxy((function(key, options) {                         
					if(key!=null && key!=""){
						var links = this.createConnections(eval(this.map[menuItems[key].name]),(String(key)).toLowerCase())
						var idx = 0;
						_.each(links, (function(link){
							dndLink(evt,this.getCanvas().getGraph(),this.getCanvas().getPaper(),link,idx);	
							idx++;
						}).bind(this));						
					}
				}).bind(this)),
				items: menuItems
			});	
			$('.'+$contextMenuId).contextMenu({x: xPos, y: yPos});
			
		}).bind(this));	
	};
		
	var dndLink = function(evt, graph, paper, link, idxOnSelection){
		var cell = graph.getCell(Edition.selection[idxOnSelection].model.get("id"));	
		link.set("source", {
			id: Edition.selection[idxOnSelection].model.get("id")
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
	};	
}