
function Pallete(){
	
	/** language used on this pallete by default */
	this.language = "MCore";
	
	/** html element identifier */
	this.$id = null;
	
	/** joint graph and paper to this pallete */
	this.palGraph = null;
	this.palPaper = null;
	
	/** setup this pallete on a html element */
	this.setup = function($id){	
		this.$id = $id;
		this.palGraph = new joint.dia.Graph;
		this.palPaper = new joint.dia.Paper({
			el: this.el(),	
			width: this.el().width(),
			height: this.el().height(),
			gridSize: 1,
			interactive: false,
			model: this.palGraph
		});	
		this.palGraph.addCells(this.elements());
	};
	
	/** getters and setters */
	this.parent = function(){ return $('#'+this.$id).parent(); };	
	this.el = function(){ return $('#'+this.$id) };	
	this.id = function(){ return $id; };
	
	/** the set of elements in this pallete */
	this.elements = function(){
		var class_ = this.createElement(joint.shapes.mcore.MClass,'Class',10,10,null);
		var dataType = this.createElement(joint.shapes.mcore.MDataType,'DataType',110, 10, null);	
		var genset = this.createElement(joint.shapes.mcore.MGeneralizationSet,'',10, 60, null);
		genset.set('size',{width: 195, height: 20});
		return [class_, dataType, genset]
	};
		
	/** auxiliary method to create an element on this pallete */
	this.createElement = function (class_, name, x, y, stereotype) {
		return new class_({
			position: { x: x  , y: y },
			name: name,
			stereotype: stereotype,
		});
	};
	
	/** enable drag and drop on a canvas. The same pallete can enable dnd into several canvases */
	this.enableDnd = function(canvas){
		this.palPaper.on('cell:pointerdown', (function(cellView, evt, x, y){		
			var fake = $("<div class='dnd'><div id='dnd'></div></div>").appendTo("body").css("left", x+"px").css("top", y+"px");	
			var fakeElem = this.createElement(eval(cellView.model.get("type")), cellView.model.get("name"), 0, 0, cellView.model.get("stereotype"));
			var fakeGraph = new joint.dia.Graph;
			var fakePaper = new joint.dia.Paper({
				el: $('#dnd'),
				width: fakeElem.get('size').width,
				height: fakeElem.get('size').height,
				gridSize: 1,
				model: fakeGraph
			}); 		
			fakeGraph.addCell(fakeElem);
			$("body").mousemove(function(evt){
				fake.css("left", (evt.pageX-45)+"px").css("top", (evt.pageY-30)+"px");
			});
			$("body").mouseup((function(evt) {
				if(evt.pageX-this.parent().width()-40 > 0){//if we are on target paper (canvas) we add the new element
					
					var elem = this.createElement(eval(cellView.model.get("type")), cellView.model.get("name"), evt.pageX-this.parent().width()-40, evt.pageY-40, cellView.model.get("stereotype"));				
					canvas.getGraph().addCell(elem);
					$("body").unbind("mousemove");
					$("body").unbind("mouseup");			    	
				}
				fake.remove();
			}).bind(this));		
		 }).bind(this));
	};
}