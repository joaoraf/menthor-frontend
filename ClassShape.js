
ClassShape = draw2d.shape.basic.Rectangle.extend({

	NAME: "ClassShape",
	
    init : function(attr){
		this._super(attr);	    				
		var font_color = "#5856d6";
		var bg_color = "#f7f7f7";				
		this.setBackgroundColor(bg_color);						
		this.container = new draw2d.shape.layout.TableLayout({stroke:0, fontColor:font_color, bgColor:bg_color});
		this.classLabel = new draw2d.shape.basic.Label({text:"ClassName", stroke:0, fontColor:font_color, bgColor:bg_color});
		this.stereotypeLabel = new draw2d.shape.basic.Label({text:"\u00AB"+"Stereotype"+"\u00BB", stroke:0, fontColor:font_color, bgColor:bg_color});
		this.classLabel.installEditor(new draw2d.ui.LabelInplaceEditor());		
		this.stereotypeLabel.installEditor(new draw2d.ui.LabelInplaceEditor());		
		this.container.addRow(this.stereotypeLabel);
        this.container.addRow(this.classLabel);
		this.container.setCellAlign(0,0, "center");
		this.container.setCellAlign(1,0, "center");	
		this.add(this.container, new draw2d.layout.locator.CenterLocator(this));
		this.setMinWidth(100);
		this.setMinHeight(50);
		this.port = this.createPort("hybrid",new draw2d.layout.locator.XYRelPortLocator(90,15));
		this.port.setBackgroundColor(font_color);
		this.port.setColor(bg_color);
		this.port.setConnectionAnchor(new draw2d.layout.anchor.ChopboxConnectionAnchor(this.port));
    },
     
    setName: function(name){
         this.classLabel.setText(name);    
         return this;
    },
     
	getName: function(){
         return classLabel.getText();
    },
	
    setStereotype: function(name){
         this.stereotypeLabel.setText("\u00AB"+name+"\u00BB");     
         return this;
    }, 

	getStereotype: function(){
         return stereotypeLabel.getText().replace("\u00AB"),replace("\u00BB");              
    }, 	
});
