
/** ------ Pallete ------ */

extend(OntoUMLPallete,Pallete);
function OntoUMLPallete(){
	
	this.language = "OntoUML"
	
	this.shapes = function(){		
		var result = []; 
		
		//initial position (10,10)
		//put the elements in two columns (10,ypos) and (110, ypos) where ypos is continually incremented of 50.
		var idx = 0; var xpos=10; var ypos=10; var col1=10; var col2=110; var rowHeight=50;
				
		//classes
		_.each(ClassStereotype, (function(s){
			if(idx>0 && idx%2!= 0) { xpos = col2; }
			if(idx>0 && idx%2===0) { xpos = col1; ypos += rowHeight; }
			var newshape = this.createShape(joint.shapes.ontouml.Class, xpos, ypos, OntoUMLClass, s.stereotype, s.name)
			result.push(newshape);
			idx++;
		}).bind(this));
		
		//data types
		_.each(DataTypeStereotype, (function(s){
			if(idx>0 && idx%2!= 0) { xpos = col2; }
			if(idx>0 && idx%2===0) { xpos = col1; ypos += rowHeight; }
			var newshape = this.createShape(joint.shapes.ontouml.DataType, xpos, ypos, OntoUMLDataType, s.stereotype, s.name)
			result.push(newshape);
			idx++;
		}).bind(this));
		
		//generalization set
		var genset = this.createShape(joint.shapes.ontouml.GeneralizationSet,col1, ypos+rowHeight, OntoUMLGeneralizationSet, null, '');
		genset.set('size',{width: 195, height: 20});
		result.push(genset);		
		
		return [result];
	}
	
	/** create both shape and content of a pallete element */
	this.createShape = function(shape_type, x, y, lang_type, stereotype, name){
		var elemContent = new lang_type(); elemContent.name = name; elemContent.stereotype = stereotype;
		var elemShape = new shape_type({ position: {x: x,y: y}, content: elemContent	});
		return elemShape;
	}	
}

/** ------ RightClick ContextMenu ------ */

extend(OntoUMLRightClickContextMenu, RightClickContextMenu);
function OntoUMLRightClickContextMenu(){
	
	this.language = "OntoUML"
	
	this.action = function(evt, key, cellView, canvas){
		// call super method
		this.$super.action.call(this, evt, key, cellView, canvas);
		
		//drag derivation relationship
		if(key==="derivedfrom")  canvas.dragDerivation(cellView, evt);
	};
	
	this.items = function(cellView){
		//call super method
		var map = this.$super.items.call(this,cellView);
		
		//drag derivation relationship
		if(cellView.model instanceof joint.shapes.ontouml.Relationship){
			if(cellView.model.getContent().stereotype === RelationshipStereotype.MATERIAL.stereotype) {
				map["derivedfrom"] = { name: "Derived From"};
			}
		}
		
		return map;
	};	
}

/** ------ Connect ContextMenu ------ */

extend(OntoUMLConnectContextMenu,ConnectContextMenu);
function OntoUMLConnectContextMenu(){
	
	this.language = "OntoUML"
	
	this.map = function(){
		var m = {}
		
		//generalization
		m['Generalization'] = 'joint.shapes.ontouml.Generalization';
		
		//relation stereotypes
		_.each(RelationshipStereotype, function(s){
			if(s.stereotype!='derivation'){ //ignore derivation
				m[s.name] = 'joint.shapes.ontouml.Relationship';
			}
		});		
		
		return m;
	}
	
	this.createConnections = function (menukey, numberOfConnections) {
		var result = [];
		//item name
		var name = this.items()[menukey].name; 
		//shape type
		var shape_type = eval(this.map()[name]);
		//stereotype
		var stereotype = stereotypeByName(RelationshipStereotype, name);
		//create N connections...
		for(var i=0; i<numberOfConnections; i++){
			//the content
			var content = new OntoUMLRelationship();
			if(name==="Generalization") content = new OntoUMLGeneralization();			
			else content.stereotype = stereotype;
			//the shape
			var elemShape = new shape_type({content: content});
			result.push(elemShape);
		};
		return result
	};	
}

/** ------ Editor ------ */

extend(OntoUMLEditor, Editor);
function OntoUMLEditor(){	

	/** override context menus */
	this.connectMenu = new OntoUMLConnectContextMenu();	
	
	this.rightClickMenu = new OntoUMLRightClickContextMenu();
	
	this.deleteShape = function(shape){	
	
		//delete the derivation if the material is deleted
		var links = this.canvas.getGraph().getConnectedLinks(shape);	
		if(shape instanceof joint.dia.Link) links.push(shape);		
		_.each(links, (function(link){			
			if(link instanceof joint.shapes.ontouml.Relationship){
				if(link.getContent().stereotype === RelationshipStereotype.MATERIAL.stereotype){					
					if(!_.isEmpty(link.getDerivation())){
						var derivationView = this.canvas.getPaper().findViewByModel(link.getDerivation());
						this.$super.deleteShape.call(this,derivationView.model);						
					}
				}
			}
		}).bind(this));
		
		// call super method
		this.$super.deleteShape.call(this,shape);
	};
	
	this.startDraggingDerivation = function(materialView, evt){		
		var materialLink = materialView.model;
		var derivationLink = materialLink.createDerivationLink(this.canvas.getPaper(), this.canvas.getGraph());
		this.canvas.getGraph().addCell(derivationLink);		
		var derivationView = this.canvas.getPaper().findViewByModel(derivationLink);
		derivationView.startArrowheadMove("target");
		//update link position
		materialLink.on('add change:vertices change:router', function(){ derivationLink.set('source',midPoint(materialView)); });
		this.canvas.getGraph().getCell(materialLink.get('source').id).on('add change:position', function(){ derivationLink.set('source',midPoint(materialView)); });
		this.canvas.getGraph().getCell(materialLink.get('target').id).on('add change:position', function(){ derivationLink.set('source', midPoint(materialView)); });
		return derivationView;
	}
	
	this.endDroppingDerivation = function(materialView, evt){
		materialView.getDerivation().set('source',midPoint(materialView));
	}
}

/** ------ Canvas ------ */

extend(OntoUMLCanvas, Canvas);
function OntoUMLCanvas(){
	
	this.language = "OntoUML";
	
	/** override the editor */
	this.editor = new OntoUMLEditor();
			
	this.dragDerivation = function(materialView, evt){
		var derivationView = this.editor.startDraggingDerivation(materialView, evt);		
		$("body").mouseup((function(evt){		
			derivationView.pointerup(evt);
			$("body").unbind();
			this.editor.endDroppingDerivation(materialView, evt);
		}).bind(this));
		$("body").mousemove((function(evt){
			var coords = this.getPaper().snapToGrid({x: evt.clientX, y: evt.clientY});
			derivationView.pointermove(evt, coords.x, coords.y)
		}).bind(this));		
	};
}