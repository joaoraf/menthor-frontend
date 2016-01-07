
function ConnectContextMenu(){
	
	/** language used on this pallete by default */
	this.language = "MCore"
	
	/** map containing the connection shape name and type */
	this.map = function(){
		var m = {}
		m['Generalization'] = 'joint.shapes.mcore.MGeneralization';
		m['Relationship'] = 'joint.shapes.mcore.MRelationship';
		return m;		
	}
	
	this.action = function(evt, menukey, canvas){
		var links = this.createConnections(menukey, canvas.getEditor().selected().length);
		var idx = 0;
		_.each(links, function(link){
			canvas.dragLinkFrom(evt, link, canvas.getEditor().selected()[idx]);
			idx++;
		});
	};
	
	/** context menu items based on the connections map */
	this.items = function(){
		var menuItems = {};
		for(key in this.map()){
			var k = (String(key)).toLowerCase()
			menuItems[k] = {name: String(key)}
		}
		return menuItems;
	};
	
	/** axiliary method to create N connection shapes for a given click on the context menu */
	this.createConnections = function (menukey, numberOfConnections) {
		var conns = []
		var connClass = eval(this.map()[this.items()[menukey].name]);
		var stereotype = (String(menukey)).toLowerCase();
		for(var i=0; i<numberOfConnections; i++){
			conns.push(new connClass());
		};
		return conns
	};	
}