/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/
/**
 * @class draw2d.Port
 * A port is an object that is used to establish a connection between a node and a {@link draw2d.Connection}. The port can 
 * be placed anywhere within a node ( see {@link draw2d.layout.locator.PortLocator} for details)
 * 
 * 
 * @author Andreas Herz
 * @extends draw2d.shape.basic.Circle
 */ 
draw2d.Port = draw2d.shape.basic.Circle.extend({
    NAME : "draw2d.Port",

    DEFAULT_BORDER_COLOR:new draw2d.util.Color("#1B1B1B"),

    MAX_SAFE_INTEGER : 9007199254740991,

    /**
     * @constructor
     * Creates a new Node element which are not assigned to any canvas.
     * 
     * @param {Object} [attr] the configuration of the shape
     */
    init: function( attr, setter, getter)
    {
        var _this = this;

        this.locator = null;
        this.lighterBgColor =null;
        
        this._super($.extend({
                bgColor: "#4f6870",
                stroke:1,
                diameter:draw2d.isTouchDevice?25:10,
                color:"#1B1B1B",
                selectable:false
            },attr),
            setter,
            getter);
        

        // status var for user interaction
        //
        this.ox = this.x;
        this.oy = this.y;
        this.coronaWidth = 5; // the corona width for the hitTest method. Useful during drag&drop of ports. Better SnapTo behavior.
        this.corona = null; // Circle
        this.useGradient = true;
        
        // currentTarget can be differ from the currentTargetPort. In this case
        // we must store booth of them for notifications hoverEnter/hoverLeft
        this.currentTargetPort = null; // port
        this.currentTarget = null; // Figure
        this.preferredConnectionDirection = null;
        
        // current attached connections
        this.connections = new draw2d.util.ArrayList();
        
    
        // avoid "undefined" values. This breaks the code on iOS.
        if(typeof name ==="undefined"){
            this.name = null;
        }
        else{
            this.name = name;
        }
        
        this.moveListener = function( figure){
            _this.repaint();
            // Falls sich der parent bewegt hat, dann muss der Port dies seinen
            // Connections mitteilen
            _this.fireEvent("move");
        };
        
        this.connectionAnchor = new draw2d.layout.anchor.ConnectionAnchor(this);

        // for dynamic diagrams. A Port can have a value which is set by a connector
        //
        this.value = null; 
        this.maxFanOut = this.MAX_SAFE_INTEGER;
        
        this.setCanSnapToHelper(false);
        
        this.installEditPolicy(new draw2d.policy.port.IntrusivePortsFeedbackPolicy());
    //    this.installEditPolicy(new draw2d.policy.port.ElasticStrapFeedbackPolicy());
    },

    /**
     * @method
     * set the maximal possible count of connections for this port.<br>
     * This method din't delete any connection if you reduce the number and a bunch of
     * connection are bounded already.
     * 
     * @param {Number} count the maximal number of connection related to this port
     */
    setMaxFanOut: function(count)
    {
        this.maxFanOut = Math.max(1,count);
        this.fireEvent("change:maxFanOut");
        
        return this;
    },
    
    /**
     * @method
     * return the maximal possible connections (in+out) for this port.
     * 
     * @returns
     */
    getMaxFanOut: function()
    {
        return this.maxFanOut;
    },
    
    /**
     * @method
     * Set the Anchor for this object. An anchor is responsible for the endpoint calculation
     * of an connection. just visible representation.
     *
     * @param {draw2d.layout.anchor.ConnectionAnchor} [anchor] the new source anchor for the connection
     **/
    setConnectionAnchor:function( anchor)
    {
        // set some good defaults.
        if(typeof anchor ==="undefined" || anchor===null)
        {
    		anchor = new draw2d.layout.anchor.ConnectionAnchor( );
    	}
    	
        this.connectionAnchor = anchor;
        this.connectionAnchor.setOwner(this);

        // the anchor has changed. In this case all connections needs an change event to recalculate
        // the anchor and the routing itself
        this.fireEvent("move");

        return this;
    },
 
    getConnectionAnchorLocation:function(referencePoint, inquiringConnection)
    {
    	return this.connectionAnchor.getLocation(referencePoint, inquiringConnection);
    },
    
    getConnectionAnchorReferencePoint:function(inquiringConnection)
    {
    	return this.connectionAnchor.getReferencePoint(inquiringConnection);
    },
 
    
    /**
     * @method
     * Returns the **direction** for the connection in relation to the given port and it's parent.
     * 
     * <p>
     * Possible values:
     * <ul>
     *   <li>up -&gt; 0</li>
     *   <li>right -&gt; 1</li>
     *   <li>down -&gt; 2</li>
     *   <li>left -&gt; 3</li>
     * </ul>
     * <p>
     * 
     * @param {draw2d.Connection} conn the related Connection
     * @param {draw2d.Port} relatedPort the counterpart port
     * @return {Number} the direction.
     */
    getConnectionDirection:function(conn, relatedPort)
    {
        // return the calculated connection direction if the port didn't have set any 
        //
        if(typeof this.preferredConnectionDirection==="undefined" || this.preferredConnectionDirection===null){
            return this.getParent().getBoundingBox().getDirection(this.getAbsolutePosition());
        }
        
        return this.preferredConnectionDirection;
    },
    
 
    
    /**
     * @method
     * Set the **direction** for the connection in relation to the given port and it's parent.
     * 
     * <p>
     * Possible values:
     * <ul>
     *   <li>up -&gt; 0</li>
     *   <li>right -&gt; 1</li>
     *   <li>down -&gt; 2</li>
     *   <li>left -&gt; 3</li>
     *   <li>calculated -&gt; null</li>
     * </ul>
     * <p>
     * 
     * @since 5.2.1
     * @param {Number} direction the preferred connection direction.
     */
    setConnectionDirection:function(direction)
    {
        this.preferredConnectionDirection = direction;

        // needs an change event to recalculate the route
        this.fireEvent("move");

        return this;
    },

    /**
     * @method
     * Set the locator/layouter of the port. A locator is responsive for the x/y arrangement of the 
     * port in relation to the parent node.
     * 
     * @param {draw2d.layout.locator.Locator} locator
     */
    setLocator: function(locator)
    {
        this.locator = locator;

        return this;
    },
    
    /**
     * @method
     * Get the locator/layouter of the port. A locator is responsive for the x/y arrangement of the 
     * port in relation to the parent node.
     * 
     * @since 4.2.0
     */
    getLocator: function()
    {
        return this.locator;
    },
    

    /**
     * @method
     * Set the new background color of the figure. It is possible to hands over
     * <code>null</code> to set the background transparent.
     *
     * @param {draw2d.util.Color} color The new background color of the figure
     **/
     setBackgroundColor : function(color)
     {
        this._super(color);
        this.lighterBgColor=this.bgColor.lighter(0.3).hash();;

        return this;
     },

    /**
     * @method
     * Set a value for the port. This is useful for interactive/dynamic diagrams like circuits, simulator,...
     *  
     * @param {Object} value the new value for the port 
     */
    setValue:function(value)
    {
        this.value = value;
        if(this.getParent()!==null){
           this.getParent().onPortValueChanged(this);
        }

        return this;
    },
    
    /**
     * @method
     * Return the user defined value of the port.
     * 
     * @returns {Object}
     */
    getValue:function()
    {
        return this.value;
    },
    
    /**
     * @inheritdoc
     */
     repaint:function(attributes)
     {
         if(this.repaintBlocked===true || this.shape===null){
             return;
         }

         attributes= attributes || {};
      
         
         // a port did have the 0/0 coordinate in the center and not in the top/left corner
         //
         attributes.cx = this.getAbsoluteX();
         attributes.cy = this.getAbsoluteY();
         attributes.rx = this.width/2;
         attributes.ry = attributes.rx;
         attributes.cursor = "move";
         
         if(this.getAlpha()<0.9 || this.useGradient===false){
             attributes.fill=this.bgColor.hash();
         }
         else{
             attributes.fill = ["90",this.bgColor.hash(),this.lighterBgColor].join("-");
         }
         
         this._super(attributes);
     },
     
    
    /**
     * @inheritdoc
     *
     **/
    onMouseEnter:function()
    {
        this._oldstroke = this.getStroke();
        this.setStroke(2);
    },
    
    
    /**
     * @inheritdoc
     * 
     **/
    onMouseLeave:function()
    {
        this.setStroke(this._oldstroke);
    },


    /**
     * @method
     * Returns a {@link draw2d.util.ArrayList} of {@link draw2d.Connection}s of all related connections to this port.
     *
     * @type {draw2d.util.ArrayList}
     **/
    getConnections:function()
    {
      return this.connections;
    },
    
    
    /**
     * @inheritdoc
     */
    setParent:function(parent)
    {
      this._super(parent);
      
      if(this.parent!==null){
        this.parent.off(this.moveListener);
      }
      
      if(this.parent!==null) {
        this.parent.on("move",this.moveListener);
      }
    },
    

    /**
     * @method
     * Returns the corona width of the Port. The corona width will be used during the
     * drag&drop of a port.
     *
     * @return {Number}
     **/
    getCoronaWidth:function()
    {
       return this.coronaWidth;
    },
    
    
    /**
     * @method
     * Set the corona width of the Port. The corona width will be used during the
     * drag&drop of a port. You can drop a port in the corona of this port to create
     * a connection. It is not neccessary to drop exactly on the port.
     *
     * @param {Number} width The new corona width of the port
     **/
    setCoronaWidth:function( width)
    {
       this.coronaWidth = width;
    },
    
    /**
     * @inheritdoc
     * 
     * @param {Number} x the x-coordinate of the mouse event
     * @param {Number} y the y-coordinate of the mouse event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     * 
     * @return {boolean}
     **/
    onDragStart : function(x, y, shiftKey, ctrlKey)
    {
        // just allow the DragOperation if the port didn't have reached the max fanOut
        // limit.
        if(this.getConnections().getSize() >= this.maxFanOut){
            return false;
        }

        var _this = this;
        
        // this can happen if the user release the mouse button outside the window during a drag&drop
        // operation
        if(this.isInDragDrop ===true){
            this.onDragEnd( x, y, shiftKey, ctrlKey);
        }
                
        this.getShapeElement().insertAfter(this.parent.getShapeElement());
       // don't call the super method. This creates a command and this is not necessary for a port
       this.ox = this.x;
       this.oy = this.y;

        // notify all installed policies
        //
        this.editPolicy.each(function(i,e){
            if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
                e.onDragStart(_this.canvas, _this, x, y, shiftKey, ctrlKey);
            }
        });

        // fire an event
        // @since 5.3.3
        this.fireEvent("dragstart",{x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});

        return true;
    },
    
    /**
     * @inheritdoc
     * 
     * @param {Number} dx the x difference between the start of the drag drop operation and now
     * @param {Number} dy the y difference between the start of the drag drop operation and now
     * @param {Number} dx2 The x diff since the last call of this dragging operation
     * @param {Number} dy2 The y diff since the last call of this dragging operation
     **/
    onDrag:function(dx, dy, dx2, dy2)
    {
      this.isInDragDrop = true;

      this._super( dx, dy);

      var _this = this;

      var target=this.getCanvas().getBestFigure(this.getAbsoluteX(),this.getAbsoluteY(), this);
      
      // the hovering element has been changed
      if(target!==this.currentTarget){
          if(this.currentTarget!==null){
              this.currentTarget.onDragLeave(this);
              this.currentTarget.fireEvent("dragLeave",{draggingElement:this});
              this.editPolicy.each(function(i,e){
                  if(e instanceof draw2d.policy.port.PortFeedbackPolicy){
                      e.onHoverLeave(_this.canvas, _this, _this.currentTarget);
                  }
              });
          }
          
          // possible hoverEnter event
          //
          if(target!==null){
              this.currentTarget= target.onDragEnter(this);
              if(this.currentTarget!==null){
                  this.currentTarget.fireEvent("dragEnter",{draggingElement:this});
            	  this.currentTargetPort = target;
                  this.editPolicy.each(function(i,e){
                      if(e instanceof draw2d.policy.port.PortFeedbackPolicy){
                          e.onHoverEnter(_this.canvas, _this, _this.currentTarget);
                      }
                  });
              }
          }
          else{
        	  this.currentTarget = null;
          }
      }

        // fire an event
        // @since 5.3.3
        this.isInDragDrop =false;
        this.fireEvent("drag",{dx:dx, dy:dy, dx2:dx2, dy2:dy2});
        this.isInDragDrop =true;
    },
    
    
    /**
     * @param {Number} x the x-coordinate of the mouse event
     * @param {Number} y the y-coordinate of the mouse event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     **/
    onDragEnd:function(x, y, shiftKey, ctrlKey)
    {
      // Don't call the parent implementation. This will create an CommandMove object
      // and store them o the CommandStack for the undo operation. This makes no sense for a
      // port.
      // draw2d.shape.basic.Rectangle.prototype.onDragEnd.call(this); DON'T call the super implementation!!!
    
      this.setAlpha(1.0);
    
      // 1.) Restore the old Position of the node
      //
      this.setPosition(this.ox,this.oy);
    
      this.isInDragDrop =false;
      
      var _this = this;
   
      // notify all installed policies
      //
      if(this.currentTarget){
	      this.editPolicy.each(function(i,e){
	          if(e instanceof draw2d.policy.port.PortFeedbackPolicy){
	              e.onHoverLeave(_this.canvas, _this, _this.currentTarget);
	          }
	      });
      }
      
      this.editPolicy.each(function(i,e){
          if(e instanceof draw2d.policy.figure.DragDropEditPolicy){
              e.onDragEnd(_this.canvas, _this, x, y, shiftKey, ctrlKey);
          }
      });

      // Reset the drag&drop flyover information 
      //
      this.currentTarget = null;
      
      // fire an event
      // @since 5.3.3
      this.fireEvent("dragend",{x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
    },
    
    /**
     * @method
     * 
     * @param {draw2d.Figure} draggedFigure The figure which is currently dragging
     * 
     * @return {draw2d.Figure} the figure which should receive the drop event or null if the element didn't want a drop event
     * @private
     **/
    onDragEnter : function( draggedFigure )
    {
    	var delegate = null;
    	var _this = this;
    	this.getCanvas().getInterceptorPolicies().each(function(i, policy){
    		delegate = policy.delegateDrop(draggedFigure, _this);
    		if(delegate!==null){
    			return false; // break the loop
    		}
    	});

    	if(delegate===null){
    		return null;
    	}
    	
        // Create a CONNECT Command to determine if we can show a Corona. 
    	//
        var request = new draw2d.command.CommandType(draw2d.command.CommandType.CONNECT);
        request.canvas = this.getCanvas();
        request.source = delegate;
        request.target = draggedFigure;
        var command = draggedFigure.createCommand(request);

        if (command === null) {
            return null;
        }

        return delegate;
    },
    
    /**
     * @method
     * 
     * @param {draw2d.Figure} figure The figure which is currently dragging
     * @private
     **/
    onDragLeave:function( figure )
    {
		// Ports accepts only Ports as DropTarget
		//
		if(!(figure instanceof draw2d.Port)){
			return;
		}
    },
    
    /**
     * @method
     * Called if the user drop this element onto the dropTarget
     * 
     * @param {draw2d.Figure} dropTarget The drop target.
     * @param {Number} x the x-coordinate of the mouse up event
     * @param {Number} y the y-coordinate of the mouse up event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     * @private
     **/
    onDrop:function(dropTarget, x, y, shiftKey, ctrlKey)
    {
        
    	// Ports accepts only Ports as DropTarget
    	//
    	if(!(dropTarget instanceof draw2d.Port)){
    		return;
    	}
 
    	var request = new draw2d.command.CommandType(draw2d.command.CommandType.CONNECT);
        request.canvas = this.parent.getCanvas();
        request.source = dropTarget;
        request.target = this;
        var command = this.createCommand(request);
        
        if(command!==null){
           this.parent.getCanvas().getCommandStack().execute(command);
        }
        this.setGlow(false);
    },
   

    /**
     * @method
     * Callback method if a new connection has created with this port
     * 
     *      // Alternatively you register for this event with:
     *      port.on("connect", function(emitterPort, connection){
     *          alert("port connected");
     *      });
     * 
     * @param {draw2d.Connection} connection The connection which has been created
     * @since 2.5.1
     * @template
     **/
    onConnect: function(connection){
    },
    
    /**
     * @method
     * Callback method if a new connection has created with this port
     * 
     *      // Alternatively you register for this event with:
     *      port.on("connect", function(emitterPort, connection){
     *          alert("port disconnected");
     *      });
     * 
     * @param {draw2d.Connection} connection The connection which has been deleted
     * @since 2.5.1
     * @template
     **/
    onDisconnect: function(connection){
    },
    
 
    /**
     * @method
     * Return the name of this port.
     *
     * @return {String}
     **/
    getName:function()
    {
      return this.name;
    },
    
    /**
     * @method
     * Set the name of this port. The name of the port can be referenced by the lookup of
     * ports in the node.
     * 
     *
     * @param {String} name The new name of this port.
     **/
    setName:function( name)
    {
      this.name=name;
    },


    /**
     * @method
     * Hit test for ports. This method respect the corona diameter of the port for the hit test.
     * The corona width can be set with {@link draw2d.Port#setCoronaWidth}
     * @param {Number} iX
     * @param {Number} iY
     * @returns {Boolean}
     */
    hitTest:function ( iX , iY)
    {
        var x   = this.getAbsoluteX()-this.coronaWidth-this.getWidth()/2;
        var y   = this.getAbsoluteY()-this.coronaWidth-this.getHeight()/2;
        var iX2 = x + this.getWidth()  + (this.coronaWidth*2);
        var iY2 = y + this.getHeight() + (this.coronaWidth*2);

        return (iX >= x && iX <= iX2 && iY >= y && iY <= iY2);
    },
    
    /**
     * @method
     * Highlight this port
     * 
     * @param {boolean} flag indicator if the figure should glow.
     */
    setGlow:function( flag)
    {
      if(flag===true && this.corona===null)
      {
    	  this.corona = new draw2d.Corona();
    	  this.corona.setDimension(this.getWidth()+(this.getCoronaWidth()*2),this.getWidth()+(this.getCoronaWidth()*2));
          this.corona.setPosition(this.getAbsoluteX()-this.getCoronaWidth()-this.getWidth()/2, this.getAbsoluteY()-this.getCoronaWidth()-this.getHeight()/2);
          
          this.corona.setCanvas(this.getCanvas());

          // important inital 
          this.corona.getShapeElement();
          this.corona.repaint();
          
          // DON'T add them to the document. The corona is just a visual feedback and not part
          // of the canvas document.
         // this.parent.getCanvas().add(this.corona,this.getAbsoluteX()-this.getCoronaWidth()-this.getWidth()/2, this.getAbsoluteY()-this.getCoronaWidth()-this.getHeight()/2);
      }
      else if(flag===false && this.corona!==null)
      {
//    	  this.parent.getCanvas().remove(this.corona);
    	  this.corona.setCanvas(null);
    	  this.corona = null;
      }
      
      return this;
    },
    
    /**
     * @inheritdoc
     */
    createCommand:function(request)
    {
       // the port has its own implementation of the CommandMove
       //
       if(request.getPolicy() === draw2d.command.CommandType.MOVE) {
         if(!this.isDraggable()){
            return null;
         }
         return new draw2d.command.CommandMovePort(this);
       }
       
       // Connect request between two ports
       //
       if(request.getPolicy() === draw2d.command.CommandType.CONNECT) {
         return new draw2d.command.CommandConnect(request.canvas,request.source,request.target, request.source);
       }
    
       return null;
    },
    
    /**
     * @method
     * Called from the figure itself when any position changes happens. All listener
     * will be informed.
     * <br>
     * DON'T fire this event if the Port is during a Drag&Drop operation. This can happen
     * if we try to connect two ports
     * 
     * @private
     **/
    fireEvent : function(event, args)
    {
        if (this.isInDragDrop === true) {
            return;
        }

        this._super(event,args);
    },
    
    /**
     * @method 
     * Return an objects with all important attributes for XML or JSON serialization
     * 
     * @return
     */
    getPersistentAttributes : function(){
       var memento= this._super();

        memento.maxFanOut = this.maxFanOut;

        // defined by the locator. Don't persist
        //
        delete memento.x;
        delete memento.y;

        // ports didn'T have children ports. In this case we
        // delete this attribute as well to avoid confusions.
        //
        delete memento.ports;

        return memento;
    },
    
    /**
     * @method 
     * Read all attributes from the serialized properties and transfer them into the shape.
     * 
     * @param {Object} memento
     */
    setPersistentAttributes : function(memento)
    {
        this._super(memento);

        if(typeof memento.maxFanOut !== "undefined"){
            // Big bug in the past.
            // I used Number.MAX_VALUE as maxFanOut which is 1.7976931348623157e+308
            // parseInt creates "1" during the reading of the JSON - which is crap.
            // BIG BIG BUG!!! my fault.
            // Now check if the memenot.maxFanOut is a number and take this without crappy parsing.
            if(typeof memento.maxFanOut ==="number"){
                this.maxFanOut = memento.maxFanOut;
            }
            else {
                this.maxFanOut = Math.max(1, parseInt(memento.maxFanOut));
            }
        }
        
        return this;
    }
});


/**
 * @class draw2d.Corona
 * Glow effect for ports. Just for internal use.
 * 
 * @extend draw2d.shape.basic.Circle
 */
draw2d.Corona = draw2d.shape.basic.Circle.extend({

    /**
     * @constructor
     * Creates a new Node element which are not assigned to any canvas.
     * 
     */
    init: function()
    {
        this._super();
        this.setAlpha(0.3);
        this.setBackgroundColor(new  draw2d.util.Color(178,225,255));
        this.setColor(new draw2d.util.Color(102,182,252));
    },
    
    /**
     * @method
     * the the opacity of the element.
     * 
     * @param {Number} percent
     */
    setAlpha : function(percent)
    {
        this._super(Math.min(0.3, percent));
        this.setDeleteable(false);
        this.setDraggable(false);
        this.setResizeable(false);
        this.setSelectable(false);
        
        return this;
    }
});
