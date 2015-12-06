function Pallete(){
	
	this.language = "MCore";
	this.graph = null;
	this.paper = null;
	this.htmlElemId = null;
	
	this.installOnDiv = function(htmlElemId){	
		this.htmlElemId = htmlElemId;
		this.graph = new joint.dia.Graph;
		this.paper = new joint.dia.Paper({
			el: $('#'+this.htmlElemId),	
			width: $("#"+this.htmlElemId).width(),
			height: $("#"+this.htmlElemId).height(),
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
				if(evt.pageX-$("#"+this.htmlElemId).parent().width()-40 > 0){//if we are on target paper (canvas) we add the new element {
					var elem = this.createElement(eval(cellView.model.get("type")), cellView.model.get("name"), evt.pageX-$("#"+this.htmlElemId).parent().width()-40, evt.pageY-40, cellView.model.get("stereotype"));				
					canvas.getGraph().addCell(elem);
					$("body").unbind("mousemove");
					$("body").unbind("mouseup");			    	
				}
				fake.remove();
			}).bind(this));		
		 }).bind(this));
	};
}