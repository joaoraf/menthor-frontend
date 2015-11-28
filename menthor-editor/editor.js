 function palleteElements(){
	var kind = new joint.shapes.ontouml.Class({	
		name: 'Kind',
		stereotype:'kind',        
		position: { x: 10, y: 10 }, 
	});	
	var collective = new joint.shapes.ontouml.Class({	
		name: 'Collective',
		stereotype:'collective',        
		position: { x: 110, y: 10 }, 
	});		
	var quantity = new joint.shapes.ontouml.Class({	
		name: 'Quantity',
		stereotype:'quantity',        
		position: { x: 10, y: 60 }, 
	});					
	var relator = new joint.shapes.ontouml.Class({	
		name: 'Relator',
		stereotype:'relator',        
		position: { x: 110, y: 60 }, 
	});	
	var mode = new joint.shapes.ontouml.Class({	
		name: 'Mode',
		stereotype:'mode',        
		position: { x: 10, y: 110 }, 
	});		
	var quality = new joint.shapes.ontouml.Class({	
		name: 'Quality',
		stereotype:'quality',        
		position: { x: 110, y: 110 }, 
	});			
	var subkind = new joint.shapes.ontouml.Class({	
		name: 'SubKind',
		stereotype:'subkind',        
		position: { x: 10, y: 160 }, 		
	});	
	var role = new joint.shapes.ontouml.Class({	
		name: 'Role',
		stereotype:'role',        
		position: { x: 110, y: 160 }, 
	});		
	var phase = new joint.shapes.ontouml.Class({	
		name: 'Phase',
		stereotype:'phase',        
		position: { x: 10, y: 210 }, 
	});		
	var category = new joint.shapes.ontouml.Class({	
		name: 'Category',
		stereotype:'category',        
		position: { x: 110, y: 210 }, 
	});	
	var roleMixin = new joint.shapes.ontouml.Class({	
		name: 'RoleMixin',
		stereotype:'roleMixin',        
		position: { x: 10, y: 260 }, 
	});		
	var phaseMixin = new joint.shapes.ontouml.Class({	
		name: 'PhaseMixin',
		stereotype:'phaseMixin',        
		position: { x: 110, y: 260 }, 
	});	
	var mixin = new joint.shapes.ontouml.Class({	
		name: 'Mixin',
		stereotype:'mixin',        
		position: { x: 10, y: 310 }, 
	});	
	return [kind, collective, quantity, relator, mode, quality, 
			subkind, role, phase,category, roleMixin, phaseMixin, mixin];
}

function runningExample(){
	var rect = new joint.shapes.ontouml.Class({	
        name: 'Forest',
		stereotype:'collective',
        attributes: ['name: String'],
        position: { x: 100, y: 130 }
    });

	var tree = new joint.shapes.ontouml.Class({	
        name: 'Tree',
		stereotype:'kind',
        position: { x: 400, y: 140 }
    });
	
	var rect3 = new joint.shapes.ontouml.Class({	
        name: 'Entity',
		stereotype: 'category',       
        position: { x: 380, y: 50 }
    });
	
	var color = new joint.shapes.ontouml.DataType({	
        name: 'Color',
		stereotype: 'quality',       
        position: { x: 530, y: 50 }
    });
	
	var link = new joint.shapes.ontouml.Relationship({
        source: { id: rect.id },
        target: { id: tree.id },
		stereotype: 'memberOf',
    });
	
	var link3 = new joint.shapes.ontouml.Relationship({
        source: { id: color.id },
        target: { id: tree.id },
		stereotype: 'structuration',
    });
	
    var link2 = new joint.shapes.ontouml.Generalization({
        source: { id: tree.id },
        target: { id: rect3.id }
    });
	return [rect, tree, rect3, color, link, link2, link3]
}

function createClass(classe, name, stereotype, x, y) {
	return new classe({
		position: { x: x  , y: y },
		name: name,
		stereotype,
	});
}
	
function setupPallete(pallete){
	//drag and drop installation
	pallete.on('cell:pointerdown', function(cellView, evt, x, y){		
		var fake = $("<div class='dnd'><div id='dnd'></div></div>").appendTo("body").css("left", x+"px").css("top", y+"px");		
		var fakeElem = createClass(eval(cellView.model.get("type")), cellView.model.get("name"), cellView.model.get("stereotype"), 0, 0);
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
		$("body").mouseup(function(evt) {
			if(evt.pageX-$("#tools").width()-40 > 0){//if we are on target paper (canvas) we add the new element {
				var elem = createClass(eval(cellView.model.get("type")), cellView.model.get("name"), cellView.model.get("stereotype"), evt.pageX-$("#tools").width()-40, evt.pageY-40);				
				graph.addCell(elem);
				$("body").unbind("mousemove");
				$("body").unbind("mouseup");			    	
			}
			fake.remove();
		});		
	 });
}