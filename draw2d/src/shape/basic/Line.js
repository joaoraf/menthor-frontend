/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/
/**
 * @class draw2d.shape.basic.Line
 * The base class for all visible elements inside a canvas.
 * 
 * See the example:
 *
 *     @example preview small frame
 *     
 *     // Create the line and modify the start/end after inserting them into 
 *     // the canvas
 *     var line1 =  new draw2d.shape.basic.Line({startX:30, startY:30, endX:100, endY:80});
 *       
 *     canvas.add(line1);
 *     
 *     // Create the line with a given start/end coordinate in the constructor
 *     //
 *     var line2 = new draw2d.shape.basic.Line({
 *           startX:20,
 *           startY:80,
 *           endX:200,
 *           endY:150, 
 *           stroke:3, 
 *           color:"#1d1dff"
 *      });
 *     canvas.add(line2);
 *     
 * @inheritable
 * @author Andreas Herz
 * @extends draw2d.Figure
 */
draw2d.shape.basic.Line = draw2d.Figure.extend({
    NAME : "draw2d.shape.basic.Line",

    DEFAULT_COLOR : new draw2d.util.Color(0,0,0),
    
    /**
     * @constructor
     * Creates a new figure element which are not assigned to any canvas witht he given start and
     * end coordinate.
     * 
     * @param {Object} [attr] the configuration of the shape
     */
    init: function(attr, setter, getter) 
    {
        // click area for the line hit test
        this.corona = 10;
        this.isGlowing = false;
        this.lineColor = this.DEFAULT_COLOR;
        this.stroke=1;
        this.outlineStroke = 0;
        this.outlineColor = new draw2d.util.Color(null);
        this.outlineVisible = false;

        this.dasharray = null;
        
        this.start = new draw2d.geo.Point(30,30);
        this.end   = new draw2d.geo.Point(100,100);

        this.vertices = new draw2d.util.ArrayList();
        this.vertices.add(this.start);
        this.vertices.add(this.end);
        
        this._super(attr, 
             $.extend({},{
                    /** @attr {Number} startX the x coordinate of the start point */
                    startX: this.setStartX,
                    /** @attr {Number} startY the y coordinate of the start point */
                    startY: this.setStartY,
                    /** @attr {Number} endX the x coordinate of the end */
                    endX: this.setEndX,
                    /** @attr {Number} endY the y coordinate of the end */
                    endY: this.setEndY,
                    /** @attr {String | draw2d.util.Color} outlineColor the outline color of the line */
                    outlineColor : this.setOutlineColor,
                    /** @attr {Number} outlineStroke the line width of the outline */
                    outlineStroke : this.setOutlineStroke,
                    /** @attr {String|draw2d.util.Color} color the color of the line */
                    color : this.setColor,
                    /** @attr {Number} stroke the line width of the color */
                    stroke : this.setStroke,
                    /** @attr {String} dasharray the line pattern see {@link draw2d.shape.basic.Line#setDashArray} for more information*/
                    dasharray : this.setDashArray,
                    /** @attr {Boolean} glow the glow flag for the shape. The representation of the "glow" depends on the shape */
                    glow  : this.setGlow
                }, setter),
                
             $.extend({},{
                outlineColor:  this.getOutlineColor,
                outlineStroke: this.getOutlineStroke,
                stroke:        this.getStroke,
                dasharray:     this.getDashArray
            }, getter));
        
        // create the selections handles/decorations
        this.installEditPolicy(new draw2d.policy.line.LineSelectionFeedbackPolicy());

        this.setSelectable(true);
        this.setDeleteable(true);
   },
   
   /**
    * @method
    * Set the outline color of the line.
    * 
    *      // Alternatively you can use the attr method:
    *      figure.attr({
    *        outlineColor: color
    *      });
    * 
    * @param {draw2d.util.Color/String} color The new color of the line.
    * @since 4.2.1
    **/
   setOutlineColor:function( color)
   {
     this.outlineColor = new draw2d.util.Color(color);
     this.repaint();
     this.fireEvent("change:outlineColor");
     
     return this;
   },

   /**
    * @method
    * The outline color of the text
    * 
    * @returns {draw2d.util.Color}
    * @since 4.2.1
    */
   getOutlineColor:function()
   {
     return this.outlineColor;
   },
   
   /**
    * @method
    * Set the outline stroke of the line to use.
    * 
    *      // Alternatively you can use the attr method:
    *      figure.attr({
    *        outlineStroke: w
    *      });
    * 
    * @param {Number} w The new outline width of the line
    * @since 4.2.1
    **/
   setOutlineStroke:function( w )
   {
     this.outlineStroke=w;
     this.repaint();
     this.fireEvent("change:outlineStroke");
     
     return this;
   },

   /**
    * @method
    * The used outline line width.
    * 
    * @type {Number}
    * @since 4.2.1
    **/
   getOutlineStroke:function( )
   {
     return this.outlineStroke;
   },

   /**
    * @method
    * Don't call them manually. This will be done by the framework.<br>
    * Will be called if the object are moved via drag and drop.
    * Sub classes can override this method to implement additional stuff. Don't forget to call
    * the super implementation via <code>this._super(dx, dy, dx2, dy2);</code>
    * @private
    * @param {Number} dx the x difference between the start of the drag drop operation and now
    * @param {Number} dy the y difference between the start of the drag drop operation and now
    * @param {Number} dx2 The x diff since the last call of this dragging operation
    * @param {Number} dy2 The y diff since the last call of this dragging operation
    **/
   onDrag : function( dx, dy, dx2, dy2)
   {
       if(this.command ===null){
           return;
       }
       
       this.command.setTranslation(dx,dy);
       
       this.vertices.each(function(i,e){
           e.translate(dx2, dy2);
       });
       this.start=this.vertices.first().clone();
       this.end=this.vertices.last().clone();

       this.svgPathString = null;
       this._super(dx, dy, dx2, dy2);
   },

   /**
    * 
    * @param {Number} x the x-coordinate of the mouse event
    * @param {Number} y the y-coordinate of the mouse event
    * @param {Boolean} shiftKey true if the shift key has been pressed during this event
    * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
    */
   onDragEnd : function( x, y, shiftKey, ctrlKey)
   {
       // Element ist zwar schon an seine Position, das Command muss aber trotzdem
       // in dem CommandStack gelegt werden damit das Undo funktioniert.
       //
       this.isInDragDrop = false;

       if(this.command===null){
           return;
       }

       var _this = this;
       
	   // we must undo the interim drag/drop translation of the line. The real translation will be done
	   // by the execute of the command. Yes - you are right. This is a HACK or design flaw :-/
	   this.getVertices().each(function(i,e){
           e.translate(-_this.command.dx, -_this.command.dy);
       });	   

       this.canvas.getCommandStack().execute(this.command);
	   this.command = null;
	   this.isMoving = false;
	   
	   // notify all installed policies
	   //
	   this.editPolicy.each(function(i,e){
    	   if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
    		   e.onDragEnd(_this.canvas, _this, x, y, shiftKey, ctrlKey);
    	   }
	   });
	   
	   // inform all other listener
       this.fireEvent("move");
       
       // fire an event
       // @since 5.3.3
       this.fireEvent("dragend",{x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});

   },

   /**
    * @method
    * Called when a user clicks on the element.
    * 
    *      // Alternatively you can register for this event with  
    *      figure.on("click", function(emitterFigure){
    *          alert("clicked");
    *      });
    *      
    * @template
    * @since 4.0.0
    */
   onClick: function()
   {
   },

   /**
    * @method
    * Set the line style for this object.
    * 
    *      // Alternatively you can use the attr method:
    *      figure.attr({
    *        dash: dashPattern
    *      });
    *      
    * @param dash can be one of this ["", "-", ".", "-.", "-..", ". ", "- ", "--", "- .", "--.", "--.."]
    */
   setDashArray: function(dashPattern)
   {
       this.dasharray = dashPattern;
       this.repaint();
       
       this.fireEvent("change:dashArray");

       return this;
   },
   
   /**
    * @method
    * Get the line style for this object.
    * 
    *      // Alternatively you can use the attr method:
    *      figure.attr("dash");
    *  
    * @since 5.1.0
    */
   getDashArray: function(dashPattern)
   {
       return this.dasharray;
   },
   
   
   /**
    * @method
    * Set the width for the click hit test of this line.
    *
    * @param {Number} width the width of the line hit test.
    **/
   setCoronaWidth:function( width)
   {
      this.corona = width;
      
      return this;
   },


   /**
    * @method
    * Called by the framework. Don't call them manually.
    * 
    * @private
    **/
   createShapeElement:function()
   {
     var set=  this.canvas.paper.set();

     // the drop shadow or border line
     set.push(this.canvas.paper.path("M"+this.start.x+" "+this.start.y+"L"+this.end.x+" "+this.end.y));
     // the main path
     set.push(this.canvas.paper.path("M"+this.start.x+" "+this.start.y+"L"+this.end.x+" "+this.end.y));
     set.node = set.items[1].node;
     
     // indicate that the outline is visible at the moment
     // the repaint update the status correct and set the attributes for 
     // the first time
     this.outlineVisible = true;
     
     return set;
   },

   /**
    * @inheritdoc
    * 
    */
   repaint:function(attributes)
   {
       if(this.repaintBlocked===true || this.shape===null){
           return;
       }

       // don't override existing values
       //
       if(typeof attributes === "undefined"){
           attributes = {"stroke":this.lineColor.hash(),
                         "stroke-width":this.stroke,
                         "path":["M",this.start.x,this.start.y,"L",this.end.x,this.end.y].join(" ")};
       }
       else{
    	   // may a router has calculate another path. don't override them.
    	   if(typeof attributes.path ==="undefined"){
    		   attributes.path =["M",this.start.x,this.start.y,"L",this.end.x,this.end.y].join(" ");
    	   }
    	   attributes.stroke = this.lineColor.hash();
    	   attributes["stroke-width"]=this.stroke;
       }
       
       if(this.dasharray!==null){
           attributes["stroke-dasharray"]=this.dasharray;
       }
       
       this._super(attributes);

       if(this.outlineStroke>0){
           this.shape.items[0].attr({"stroke-width":(this.outlineStroke+this.stroke), "stroke":this.outlineColor.hash()});
           if(this.outlineVisible===false)
               this.shape.items[0].show();
           this.outlineVisible = true;
       }
       else if(this.outlineVisible===true){
           // reset them once
           this.shape.items[0].attr({"stroke-width":0, "stroke":"none"});
           this.shape.items[0].hide();
       }
   },
   
   /**
    * @method
    * Moves the element to the background. Additional
    * the internal model changed as well.
    * 
    * @since 4.7.2
    */
   toBack: function(figure )
   {
	   this._super(figure);
	   
	   if(this.outlineVisible===true){
    	   this.shape.items[0].insertBefore(this.shape.items[1]);
	   }
       
       return this;
   },
   
   
   /**
    * @method
    * Highlight the element or remove the highlighting
    * 
    *      // Alternatively you can use the attr method:
    *      figure.attr({
    *        glow: flag
    *      });
    *      
    * @param {Boolean} flag indicates glow/noGlow
    * @template
    */
   setGlow: function(flag)
   {
	   if(this.isGlowing===flag){
		   return;
	   }
	   
	   if(flag===true){
		   // store old values for restore
		   this._lineColor = this.lineColor;
		   this._stroke = this.stroke;
		   
	       this.setColor( new draw2d.util.Color("#3f72bf"));
	       this.setStroke((this.stroke*4)|0);
	   }
	   else{
	       this.setColor(this._lineColor);
	       this.setStroke(this._stroke);
	   }
	   
	   this.isGlowing = flag;
	   
	   return this;
   },


   /**
    * You can't drag&drop the resize handles if the line not resizeable.
    * @type boolean
    **/
   isResizeable:function()
   {
     return true;
   },


   /**
    * Set the line width. This enforce a repaint of the line.
    * This method fires a <i>document dirty</i> event.
    * 
    *      // Alternatively you can use the attr method:
    *      figure.attr({
    *        stroke: w
    *      });
    *
    * @param {Number} w The new line width of the figure.
    **/
   setStroke:function(w)
   {
     this.stroke=parseFloat(w);
     
     this.repaint();
     this.fireEvent("change:stroke");
     
     return this;
   },


   /**
    * @method
    * The used line width.
    * 
    * @type {Number}
    **/
   getStroke:function( )
   {
     return this.stroke;
   },


   /**
    * @method
    * Set the color of the line.
    * This method fires a <i>document dirty</i> event.
    * 
    *      // Alternatively you can use the attr method:
    *      figure.attr({
    *        color: color
    *      });
    *      
    * @param {draw2d.util.Color|String} color The new color of the line.
    **/
   setColor:function( color)
   {
     this.lineColor = new draw2d.util.Color(color);
     this.repaint();
     this.fireEvent("change:color");
     
     return this;
   },

   /**
    * @method
    * Return the current paint color.
    * 
    * @return {draw2d.util.Color} The paint color of the line.
    **/
   getColor:function()
   {
     return this.lineColor;
   },

   /**
    * @method
    * Translate the line with the given x/y offset.
    *
    * @param {Number} dx The new x translate offset
    * @param {Number} dy The new y translate offset
    * @since 4.1.0
    **/
   translate:function(dx , dy )
   {
       this.vertices.each(function(i,e){
           e.translate(dx, dy);
       });
       this.start=this.vertices.first().clone();
       this.end=this.vertices.last().clone();

       var _this = this;
       this.editPolicy.each(function(i,e){
           if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
               e.moved(_this.canvas, _this);
           }
       });
       
       this.svgPathString = null;
       this.repaint();

       return this;
   },

   /**
    * @method
    * return the bounding box of the line or polygon
    * 
    * TODO: precalculate or cache this values
    * 
    * @returns {draw2d.geo.Rectangle}
    * @since 4.8.2
    */
   getBoundingBox: function()
   {
       var minX = Math.min.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.x;}));
       var minY = Math.min.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.y;}));
       var maxX = Math.max.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.x;}));
       var maxY = Math.max.apply(Math,$.map(this.vertices.asArray(),function(n,i){return n.y;}));
       var width = maxX - minX;
       var height= maxY - minY;
       
       return new draw2d.geo.Rectangle(minX, minY, width, height);
   },
   

   /**
    * @method
    * Set the start point of the line.
    * This method fires a <i>document dirty</i> event.
    *
    *      // Alternatively you can use the attr method:
    *      figure.attr({
    *        startX: x,
    *        startY: y
    *      });
    *      
    * @param {Number} x the x coordinate of the start point
    * @param {Number} y the y coordinate of the start point
    **/
   setStartPoint:function( x, y)
   {
     if(this.start.x===x && this.start.y===y){
        return this;
     }

     this.start.setPosition(x, y);
     this.repaint();

     var _this = this;
     this.editPolicy.each(function(i,e){
         if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
             e.moved(_this.canvas, _this);
         }
     });
     this.fireEvent("change:start");

     return this;
  },


  setStartX: function(x)
  {
      this.setStartPoint(x, this.start.y);
  },
  
  setStartY: function(y)
  {
      this.setStartPoint(this.start.x, y);
  },
  
  setEndX: function(x)
  {
      this.setEndPoint(x, this.end.y);
  },
  
  setEndY: function(y)
  {
      this.setEndPoint(this.start.x, y);
  },

   /**
    * Set the end point of the line.
    * This method fires a <i>document dirty</i> event.
    *
    *      // Alternatively you can use the attr method:
    *      figure.attr({
    *        endX: x,
    *        endY: y
    *      });
    *      
    * @param {Number} x the x coordinate of the end point
    * @param {Number} y the y coordinate of the end point
    **/
   setEndPoint:function(x, y)
   {
     if(this.end.x===x && this.end.y===y){
        return this;
     }

     this.end.setPosition(x, y);
     this.repaint();

     var _this = this;
     this.editPolicy.each(function(i,e){
         if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
             e.moved(_this.canvas, _this);
         }
     });
     
     this.fireEvent("change:end");

     return this;
 },

   /**
    * @method
    * Return the x coordinate of the start.
    * @deprecated
    * @return {Number}
    **/
   getStartX:function()
   {
     return this.start.x;
   },

   /**
    * @method
    * Return the y coordinate of the start.
    * 
    * @deprecated
    * @return {Number}
    **/
   getStartY:function()
   {
     return this.start.y;
   },

   /**
    * @method
    * Return the start point.
    * 
    * @return {draw2d.geo.Point}
    **/
   getStartPoint:function()
   {
     return this.start.clone();
   },


   /**
    * @method
    * Return the x coordinate of the end point
    * 
    * @deprecated
    * @return {Number}
    **/
   getEndX:function()
   {
     return this.end.x;
   },

   /**
    * @method
    * Return the y coordinate of the end point.
    * 
    * @deprecated
    * @return {Number}
    **/
   getEndY:function()
   {
     return this.end.y;
   },

   /**
    * @method
    * Return the end point.
    * 
    * @return {draw2d.geo.Point}
    **/
   getEndPoint:function()
   {
     return this.end.clone();
   },


   /**
    * @method
    * Return the Vertex with the given index.
    *
    * @param {Number} index the index of the vertex to return
    */
   getVertex:function( index)
   {
       return this.vertices.get(index);
   },
 
   /**
    * @method
    * Returns the vertices of the connection
    *
    * @return {draw2d.util.ArrayList} an draw2d.util.ArrayList of type draw2d.Point
    **/
   getVertices:function()
   {
       return this.vertices;
   },
   /* @deprecated */
   getPoints:function (){return this.getVertices();},

   /**
    * @method
    * Update the vertices of the object. The given array is copied and assigned.
    * 
    * @param {draw2d.util.ArrayList} vertices the new vertices of the polyline. 
    * 
    * @since 4.0.1
    */
   setVertices : function(vertices) 
   {
       this.vertices= vertices.clone(true);

       this.start=this.vertices.first().clone();
       this.end=this.vertices.last().clone();

       // update the UI and the segment parts
       this.svgPathString = null;
       this.repaint();

       var _this = this;
       // align the SelectionHandles to the new situation
       // This is a Hack....normally this should be done below and the Line shouldn't know 
       // something about this issue....this is complete a "EditPolicy" domain to handle this. 
       if(!this.selectionHandles.isEmpty()){
           this.editPolicy.each(function(i, e) {
               if (e instanceof draw2d.policy.figure.SelectionFeedbackPolicy) {
                   e.onUnselect(_this.canvas, _this);
                   e.onSelect(_this.canvas, _this);
               }
           });
       }

       // notify the listener about the changes
       this.editPolicy.each(function(i, e) {
           if (e instanceof draw2d.policy.figure.DragDropEditPolicy) {
               e.moved(_this.canvas, _this);
           }
       });

       this.fireEvent("change:vertices");

       return this;
   },

   /**
    * @method
    * Return the segments of the line with {start:s, end: e} JSON array list
    * 
    * @returns {draw2d.util.ArrayList}
    */
   getSegments: function()
   {
       var result = new draw2d.util.ArrayList();
       result.add({start: this.getStartPoint(), end: this.getEndPoint()});
       
       return result;
   },
   
   /**
    * @method
    * Returns the length of the line.
    * 
    * @return {Number}
    **/
   getLength:function()
   {
     return Math.sqrt((this.start.x-this.end.x)*(this.start.x-this.end.x)+(this.start.y-this.end.y)*(this.start.y-this.end.y));
   },

   /**
    * @method
    * Returns the angle of the line in degree.
    *
    * <pre>
    *                                 270°
    *                               |
    *                               |
    *                               |
    *                               |
    * 180° -------------------------+------------------------> +X
    *                               |                        0°
    *                               |
    *                               |
    *                               |
    *                               V +Y
    *                              90°
    * </pre>
    * @return {Number}
    **/
   getAngle:function()
   {
     var length = this.getLength();
     var angle = -(180/Math.PI) *Math.asin((this.start.y-this.end.y)/length);

     if(angle<0)
     {
        if(this.end.x<this.start.x){
          angle = Math.abs(angle) + 180;
        }
        else{
          angle = 360- Math.abs(angle);
        }
     }
     else
     {
        if(this.end.x<this.start.x){
          angle = 180-angle;
        }
     }
     return angle;
   },

   /**
    * @method
    * Returns the Command to perform the specified Request or null if the shape want cancel the 
    * operation or it can't operate the command.
    *
    * @param {draw2d.command.CommandType} request describes the Command being requested
    * @return {draw2d.command.Command} null or a Command
    * @private
    **/
   createCommand:function( request)
   {
     if(request.getPolicy() === draw2d.command.CommandType.MOVE)
     {
         if(this.isDraggable()){
             return new draw2d.command.CommandMoveLine(this);
          }
     }
     if(request.getPolicy() === draw2d.command.CommandType.DELETE)
     {
        if(this.isDeleteable()===false){
           return null;
        }
        return new draw2d.command.CommandDelete(this);
     }
     
     return null;
   },

   /**
    * @method
    * Checks if the hands over coordinate close to the line. The 'corona' is considered
    * for this test. This means the point isn't direct on the line. Is it only close to the
    * line!
    *
    * @param {Number} px the x coordinate of the test point
    * @param {Number} py the y coordinate of the test point
    * @return {boolean}
    **/
   hitTest: function( px, py)
   {
     return draw2d.shape.basic.Line.hit(this.corona+ this.stroke, this.start.x,this.start.y, this.end.x, this.end.y, px,py);
   },
   
   /**
    * @method
    * Return all intersection points between the given Line.
    * 
    * @param {draw2d.shape.basic.Line} other
    * @returns {draw2d.util.ArrayList}
    */
   intersection: function (other)
   {
       var result = new draw2d.util.ArrayList();
       
       // empty result. the lines are equal...infinit array
       if(other === this){
           return result;
       }
       
       var segments1= this.getSegments();
       var segments2= other.getSegments();
       
       segments1.each(function(i, s1){
           segments2.each(function(j, s2){
               var p= draw2d.shape.basic.Line.intersection(s1.start, s1.end, s2.start, s2.end);
               if(p!==null){
                   result.add(p);
               }
           });
       });
       return result;
   },
   
   
   /**
    * @method 
    * Return an objects with all important attributes for XML or JSON serialization
    * 
    * @returns {Object}
    */
   getPersistentAttributes : function()
   {
       var memento = this._super();
       delete memento.x;
       delete memento.y;
       delete memento.width;
       delete memento.height;

       memento.stroke = this.stroke;
       memento.color  = this.getColor().hash();
       memento.outlineStroke = this.outlineStroke;
       memento.outlineColor = this.outlineColor.hash();
       if(this.dasharray!==null){
           memento.dasharray = this.dasharray;
       }

       if(this.editPolicy.getSize()>0){
           memento.policy = this.editPolicy.getFirstElement().NAME;
       }
       
       return memento;
   },
   
   /**
    * @method 
    * Read all attributes from the serialized properties and transfer them into the shape.
    * 
    * @param {Object} memento
    * @returns 
    */
   setPersistentAttributes : function(memento)
   {
       this._super(memento);

       if(typeof memento.dasharray ==="string"){
           this.dasharray = memento.dasharray;
       }
       if(typeof memento.stroke !=="undefined"){
           this.setStroke(parseFloat(memento.stroke));
       }
       if(typeof memento.color !=="undefined"){
           this.setColor(memento.color);
       }
       if(typeof memento.outlineStroke !=="undefined"){
           this.setOutlineStroke(memento.outlineStroke);
       }
       if(typeof memento.outlineColor !=="undefined"){
           this.setOutlineColor(memento.outlineColor);
       }
       if(typeof memento.policy !=="undefined"){
           try{
               this.installEditPolicy(eval("new "+memento.policy +"()" ));
           }
           catch(exc){
               debug.warn("Unable to install edit policy '"+memento.policy+"' forced by "+this.NAME+".setPersistendAttributes. Using default.");
           }
       }
   }
});


/**
 * see: http://en.wikipedia.org/wiki/Line-line_intersection
 * 
 * @param {draw2d.geo.Point} a1
 * @param {draw2d.geo.Point} a2
 * @param {draw2d.geo.Point} b1
 * @param {draw2d.geo.Point} b2
 * 
 * @static
 * @private
 * @returns {draw2d.geo.Point}
 */
draw2d.shape.basic.Line.intersection = function(a1, a2, b1, b2) {
    var result=null;
    
    var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    if ( u_b != 0 ) {
        var ua = ua_t / u_b;
        var ub = ub_t / u_b;

        if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
            result = new draw2d.geo.Point((a1.x + ua * (a2.x - a1.x))|0, (a1.y + ua * (a2.y - a1.y))|0);
            
            // determine if the lines are crossing or just touching
            //
            result.justTouching=( 0 == ua || ua == 1 || 0 == ub || ub == 1 );
        }
    }

    return result;
};

/**
 * Static util function to determine is a point(px,py) on the line(x1,y1,x2,y2)
 * A simple hit test.
 * 
 * @return {boolean}
 * @static
 * @private
 * @param {Number} coronaWidth the accepted corona for the hit test
 * @param {Number} X1 x coordinate of the start point of the line
 * @param {Number} Y1 y coordinate of the start point of the line
 * @param {Number} X2 x coordinate of the end point of the line
 * @param {Number} Y2 y coordinate of the end point of the line
 * @param {Number} px x coordinate of the point to test
 * @param {Number} py y coordinate of the point to test
 **/
draw2d.shape.basic.Line.hit= function( coronaWidth, X1, Y1,  X2,  Y2, px, py)
{
  // Adjust vectors relative to X1,Y1
  // X2,Y2 becomes relative vector from X1,Y1 to end of segment
  X2 -= X1;
  Y2 -= Y1;
  // px,py becomes relative vector from X1,Y1 to test point
  px -= X1;
  py -= Y1;
  var dotprod = px * X2 + py * Y2;
  var projlenSq;
  if (dotprod <= 0.0) {
      // px,py is on the side of X1,Y1 away from X2,Y2
      // distance to segment is length of px,py vector
      // "length of its (clipped) projection" is now 0.0
      projlenSq = 0.0;
  } else {
      // switch to backwards vectors relative to X2,Y2
      // X2,Y2 are already the negative of X1,Y1=>X2,Y2
      // to get px,py to be the negative of px,py=>X2,Y2
      // the dot product of two negated vectors is the same
      // as the dot product of the two normal vectors
      px = X2 - px;
      py = Y2 - py;
      dotprod = px * X2 + py * Y2;
      if (dotprod <= 0.0) {
          // px,py is on the side of X2,Y2 away from X1,Y1
          // distance to segment is length of (backwards) px,py vector
          // "length of its (clipped) projection" is now 0.0
          projlenSq = 0.0;
      } else {
          // px,py is between X1,Y1 and X2,Y2
          // dotprod is the length of the px,py vector
          // projected on the X2,Y2=>X1,Y1 vector times the
          // length of the X2,Y2=>X1,Y1 vector
          projlenSq = dotprod * dotprod / (X2 * X2 + Y2 * Y2);
      }
  }
    // Distance to line is now the length of the relative point
    // vector minus the length of its projection onto the line
    // (which is zero if the projection falls outside the range
    //  of the line segment).
    var lenSq = px * px + py * py - projlenSq;
    if (lenSq < 0) {
        lenSq = 0;
    }
    return Math.sqrt(lenSq)<coronaWidth;
};

