
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
		this.palGraph.addCells(this.shapes());
	};
	
	/** getters and setters */
	this.parent = function(){ return $('#'+this.$id).parent(); };	
	this.el = function(){ return $('#'+this.$id) };	
	this.id = function(){ return $id; };
	
	/** the set of shapes in this pallete */
	this.shapes = function(){		
		var classShape = new joint.shapes.mcore.MClass({position: {x: 10, y: 10} });
		
		var dataTypeShape = new joint.shapes.mcore.MDataType({position: {x: 10, y: 60} });							
		var enum_ = new MDataType(); enum_.stereotype = 'enumeration'; enum_.name = 'Enumeration';
		var enumTypeShape = new joint.shapes.mcore.MDataType({position: {x: 110, y: 60}, content: enum_ });
		
		var genSetShape = new joint.shapes.mcore.MGeneralizationSet({position: {x: 10, y: 110} });
		genSetShape.set('size',{width: 195, height: 20});	
		
		return [classShape, dataTypeShape, genSetShape, enumTypeShape]
	};
	
	/** enable drag and drop on a canvas. The same pallete can enable dnd into several canvases */
	this.enableDnd = function(canvas){
		this.palPaper.on('cell:pointerdown', (function(cellView, evt, x, y){				
			var fake = $("<div class='dnd'><div id='dnd'></div></div>").appendTo("body").css("left", evt.pageX-45+"px").css("top", evt.pageY-30+"px");				
			var fakeGraph = new joint.dia.Graph;
			var fakeShape = cellView.model.cloneShape(this.palGraph);			
			fakeShape.set('position',{x:0,y:0});
			var fakePaper = new joint.dia.Paper({
				el: $('#dnd'),
				width: fakeShape.get('size').width,
				height: fakeShape.get('size').height,				
				model: fakeGraph
			});			
			fakeGraph.addCell(fakeShape);
			$("body").mousemove(function(evt){
				fake.css("left", (evt.pageX-45)+"px").css("top", (evt.pageY-30)+"px");
			});
			$("body").mouseup((function(evt) {				
				if(evt.pageX-this.parent().width()-40 > 0){//if we are on target paper (canvas) we add the new element					
					var realShape = cellView.model.cloneShape(this.palGraph);										
					canvas.getEditor().renameShape(realShape);
					canvas.getEditor().addShape(realShape,evt.pageX-this.parent().width()-40,evt.pageY-40);					
					realShape.updateViewOn(canvas.getPaper()); 					
					$("body").unbind("mousemove");
					$("body").unbind("mouseup");			    	
				}
				fake.remove();
			}).bind(this));		
		 }).bind(this));
	};
}