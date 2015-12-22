
function ConnectContextMenu(){
	
	/** language used on this pallete by default */
	this.language = "MCore"
	
	/** map containing the connection name and type */
	this.map = { 
		'Generalization': 'joint.shapes.mcore.MGeneralization', 
		'Relationship': 'joint.shapes.mcore.MRelationship'
	}
	
	/** context menu items based on the connections map */
	this.items = function(){
		var menuItems = {};
		for(key in this.map){
			var k = (String(key)).toLowerCase()
			menuItems[k] = {name: String(key)}
		}
		return menuItems;
	};
	
	/** axiliary method to create N connections for a given click on the context menu */
	this.createConnections = function (menukey, numberOfConnections) {
		var conns = []
		var connClass = eval(this.map[this.items()[menukey].name]);
		var stereotype = (String(menukey)).toLowerCase();
		for(var i=0; i<numberOfConnections; i++){
			conns.push(new connClass({stereotype:stereotype}));
		};
		return conns
	};	
}