/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************//**
 * @class draw2d.Canvas
 * Interactive paint area of the draw2d library.
 * <br>
 * <strong>Usage</strong>
 *      
 *      
 *      $(window).load(function () {
 *          
 *          var canvas = new draw2d.Canvas("gfx_holder");
 *      
 *          var figure1 = new draw2d.shape.basic.Oval();
 *          var figure2 = new draw2d.shape.basic.Rectangle();
 *          canvas.add(figure1,100,100);
 *          canvas.add(figure2,120,150);
 *      });
 *      
 *      
 * @inheritable
 * @author Andreas Herz
 */
draw2d.Canvas = Class.extend(
{
    NAME : "draw2d.Canvas",

    /**
     * @constructor
     * Create a new canvas with the given HTML DOM references.
     * 
     * @param {String} canvasId the id of the DOM element to use a parent container
     */
    init: function(canvasId, width, height)
    {
        var _this = this;
        // Hook the canvas calculation for IE8
        //
        if (navigator.appName == 'Microsoft Internet Explorer')
        {
          var ua = navigator.userAgent;
          var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
          if (re.exec(ua) != null){
            rv = parseInt( RegExp.$1 );
            if(rv===8){
                this.fromDocumentToCanvasCoordinate = this._fromDocumentToCanvasCoordinate_IE8_HACK;
            }
          }
        }

        this.setScrollArea(document.body);
        this.canvasId = canvasId;
        this.html = $("#"+canvasId);
        this.html.css({"cursor":"default"});
        if(typeof width!=="undefined"){
            this.initialWidth = width;
            this.initialHeight = height;
        }
        else{
            this.initialWidth = this.getWidth();
            this.initialHeight = this.getHeight();
        }
        
        // avoid the "highlighting" in iPad, iPhone if the user tab/touch on the canvas.
        // .... I don't like this.
        this.html.css({"-webkit-tap-highlight-color": "rgba(0,0,0,0)"});
        
        // Drag&Drop Handling from foreign DIV into the Canvas
        // Only available in combination with jQuery-UI
        //
        // Create the droppable area for the css class "draw2d_droppable"
        // This can be done by a palette of toolbar or something else.
        // For more information see : http://jqueryui.com/demos/droppable/
        //
        if(typeof this.html.droppable !=="undefined"){
            this.html.droppable({
                accept: '.draw2d_droppable',
                over: function(event, ui) {
                    _this.onDragEnter(ui.draggable);
                },
                out: function(event, ui) {
                    _this.onDragLeave(ui.draggable);
                },
                drop:function(event, ui){
                    event = _this._getEvent(event);
                    var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                    _this.onDrop(ui.draggable, pos.getX(), pos.getY(), event.shiftKey, event.ctrlKey);
                }
            });
        
            // Create the jQuery-Draggable for the palette -> canvas drag&drop interaction
            //
            $(".draw2d_droppable").draggable({
                appendTo:"body",
                stack:"body",
                zIndex: 27000,
                helper:"clone",
                drag: function(event, ui){
                    event = _this._getEvent(event);
                    var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                    _this.onDrag(ui.draggable, pos.getX(), pos.getY(), event.shiftKey, event.ctrlKey);
                },
                stop: function(e, ui){
                },
                start: function(e, ui){
                    $(ui.helper).addClass("shadow");
                }
           });
        }

        // painting stuff
        //
        if(typeof height!== "undefined"){
            this.paper = Raphael(canvasId, width, height);
        }
        else{
            this.paper = Raphael(canvasId, this.getWidth(), this.getHeight());
        }
        this.paper.canvas.style.position="absolute";
        
        // Status handling
        //
        this.zoomFactor = 1.0; // range [0.001..10]
        this.selection  = new draw2d.Selection();
        this.currentDropTarget = null;
        this.currentHoverFigure = null;
        
        // eventhandling since version 5.0.0
        this.eventSubscriptions = {};
        
        this.editPolicy = new draw2d.util.ArrayList();

        // internal document with all figures, ports, ....
        //
        this.figures     = new draw2d.util.ArrayList();
        this.lines       = new draw2d.util.ArrayList(); // crap - why are connections not just figures. Design by accident
        this.commonPorts = new draw2d.util.ArrayList();
        this.dropTargets = new draw2d.util.ArrayList();
        
        // all visible resize handles which can be drag&drop around. Selection handles like AntRectangleSelectionFeedback
        // are not part of this collection. Required for hitTest only
        this.resizeHandles = new draw2d.util.ArrayList();
        
        // The CommandStack for undo/redo operations
        // 
        this.commandStack = new draw2d.command.CommandStack();
       
        // INTERSECTION/CROSSING handling for connections and lines
        //
        this.linesToRepaintAfterDragDrop =  new draw2d.util.ArrayList();
        this.lineIntersections = new draw2d.util.ArrayList();
       
        this.installEditPolicy( new draw2d.policy.canvas.DefaultKeyboardPolicy());      // Handles the keyboard interaction
        this.installEditPolicy( new draw2d.policy.canvas.BoundingboxSelectionPolicy()); // Responsible for selection handling
        this.installEditPolicy( new draw2d.policy.canvas.ConnectionInterceptorPolicy());// Responsible for port, connection and drop operations
        
        // Calculate all intersection between the different lines
        //
        this.commandStack.addEventListener(function(event){
            if(event.isPostChangeEvent()===true){
                _this.calculateConnectionIntersection();
                _this.linesToRepaintAfterDragDrop.each(function(i,line){
                    line.svgPathString=null;
                    line.repaint();
                });
                _this.linesToRepaintAfterDragDrop =  new draw2d.util.ArrayList();
            }
        });
        
        // DragDrop status handling
        //
        this.mouseDown  = false;
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        this.mouseDragDiffX =0;
        this.mouseDragDiffY =0;

        this.html.bind("mouseup touchend", function(event)
        {
            if (_this.mouseDown === false){
                return;
            }

            event = _this._getEvent(event);
            _this.calculateConnectionIntersection();

            _this.mouseDown = false;
            var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
            _this.editPolicy.each(function(i,policy){
                policy.onMouseUp(_this, pos.x, pos.y, event.shiftKey, event.ctrlKey);
            });
            
            _this.mouseDragDiffX = 0;
            _this.mouseDragDiffY = 0;
        });

        this.html.bind("mousemove touchmove", function(event)
        {
            event = _this._getEvent(event);
            if (_this.mouseDown === false){
               var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
               // mouseEnter/mouseLeave events for Figures. Don't use the Raphael or DOM native functions.
               // Raphael didn't work for Rectangle with transparent fill (events only fired for the border line)
               // DOM didn't work well for lines. No eclipse area - you must hit the line exact to retrieve the event.
               // In this case I implement my own stuff...again and again.
               //
               // don't break the main event loop if one element fires an error during enter/leave event.
               try{
	               var hover = _this.getBestFigure(pos.x,pos.y);
	               if(hover !== _this.currentHoverFigure && _this.currentHoverFigure!==null){
	            	   _this.currentHoverFigure.onMouseLeave();
	            	   _this.currentHoverFigure.fireEvent("mouseleave");
	               }
	               if(hover !== _this.currentHoverFigure && hover!==null){
	            	   hover.onMouseEnter();
	            	   hover.fireEvent("mouseenter");
	               }
	               _this.currentHoverFigure = hover;
               }
               catch(exc){
            	   // just write it to the console
            	   console.log(exc);
               }

               _this.editPolicy.each(function(i,policy){
                   policy.onMouseMove(_this, pos.x, pos.y, event.shiftKey, event.ctrlKey);
               });
            }
            else{
               var diffXAbs = (event.clientX - _this.mouseDownX)*_this.zoomFactor;
               var diffYAbs = (event.clientY - _this.mouseDownY)*_this.zoomFactor;
               _this.editPolicy.each(function(i,policy){
                   policy.onMouseDrag(_this,diffXAbs, diffYAbs, diffXAbs-_this.mouseDragDiffX, diffYAbs-_this.mouseDragDiffY);
               });
               _this.mouseDragDiffX = diffXAbs;
               _this.mouseDragDiffY = diffYAbs;
           }
        });
        
        this.html.bind("mousedown touchstart", function(event)
        {
            try{
            var pos = null;
            switch (event.which) {
            case 1: //touch pressed
            case 0: //Left mouse button pressed
                try{
                    event.preventDefault();
                    event = _this._getEvent(event);
                    _this.mouseDownX = event.clientX;
                    _this.mouseDownY = event.clientY;
                    _this.mouseDragDiffX = 0;
                    _this.mouseDragDiffY = 0;
                    pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                    _this.mouseDown = true;
                    _this.editPolicy.each(function(i,policy){
                        policy.onMouseDown(_this,pos.x,pos.y, event.shiftKey, event.ctrlKey);
                    });
                }
                catch(exc){
                    console.log(exc);
                }
                break;
            case 3: //Right mouse button pressed             
                event.preventDefault();
                event = _this._getEvent(event);
                pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                _this.onRightMouseDown(pos.x, pos.y, event.shiftKey, event.ctrlKey);
                break;
            case 2:
                //Middle mouse button pressed
                break;
             default:
                //You have a strange mouse
            }
            }
            catch(exc){
                console.log(exc);
            }
        });
        
        
        // Catch the dblclick and route them to the Canvas hook.
        //
        this.html.on("dblclick",function(event)
        {
            event = _this._getEvent(event);

            _this.mouseDownX = event.clientX;
            _this.mouseDownY = event.clientY;
            var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
            _this.onDoubleClick(pos.x, pos.y, event.shiftKey, event.ctrlKey);
        });

        
        // Catch the click event and route them to the canvas hook
        //
        this.html.on("click",function(event)
        {
            event = _this._getEvent(event);

            // fire only the click event if we didn't move the mouse (drag&drop)
            //
            if(_this.mouseDownX === event.clientX ||  _this.mouseDownY === event.clientY){
                var pos = _this.fromDocumentToCanvasCoordinate(event.clientX, event.clientY);
                _this.onClick(pos.x, pos.y, event.shiftKey, event.ctrlKey);
            }
        });

        // Catch the keyUp and CTRL-key and route them to the Canvas hook.
        //
        this.keyupCallback = function(event) {
            // don't initiate the delete command if the event comes from an INPUT field. In this case the user want delete
            // a character in the input field and not the related shape
            var target =$(event.target);
            if(!target.is("input") && !target.is("textarea")){
                _this.editPolicy.each(function(i,policy){
                    if(policy instanceof draw2d.policy.canvas.KeyboardPolicy){
                        policy.onKeyUp(_this, event.keyCode, event.shiftKey, event.ctrlKey);
                    }
               });
             }
        };
        $(document).bind("keyup", this.keyupCallback);

        // Catch the keyDown and CTRL-key and route them to the Canvas hook.
        //
        this.keydownCallback = function(event) {
            // don't initiate the delete command if the event comes from an INPUT field. In this case the user want delete
            // a character in the input field and not the related shape
            var target =$(event.target);
            if(!target.is("input") && !target.is("textarea")){
               _this.editPolicy.each(function(i,policy){
                   if(policy instanceof draw2d.policy.canvas.KeyboardPolicy){
                       policy.onKeyDown(_this, event.keyCode, event.shiftKey, event.ctrlKey);
                   }
              });
            }
        };
        $(document).bind("keydown",this.keydownCallback);

    },
    
    /**
     * @method
     * Call this method if you didn't need the canvas anymore. The method unregister all even handlers
     * and free all resources. The canvas is unusable after this call
     * 
     * @since. 4.7.4
     */
    destroy : function()
    {
      this.clear();
      $(document).unbind("keydown", this.keydownCallback);
      $(document).unbind("keyup"  , this.keyupCallback);
      // reset the event handlers of the canvas without any notice
      //
      this.eventSubscriptions = {};
      
     try{
          this.paper.remove();
      }catch(exc){
          // breaks in some ie7 version....don't care about this because ie7/8 isn't a state of the art browser  ;-)
      }
    },

    /**
     * @method
     * Reset the canvas and delete all model elements.<br>
     * You can now reload another model to the canvas with a {@link draw2d.io.Reader}
     * 
     * @since 1.1.0
     */
    clear: function()
    {
        // notice all listener that the canvas will be cleared
        this.fireEvent("clear");
        
        var _this = this;

        this.lines.clone().each(function(i,e){
            _this.remove(e);
        });
        
         this.figures.clone().each(function(i,e){
            _this.remove(e);
        });
        
        this.zoomFactor =1.0;
        this.selection.clear();
        this.currentDropTarget = null;

        // internal document with all figures, ports, ....
        //
        this.figures = new draw2d.util.ArrayList();
        this.lines = new draw2d.util.ArrayList();
        this.commonPorts = new draw2d.util.ArrayList();
        this.dropTargets = new draw2d.util.ArrayList();
       
        this.commandStack.markSaveLocation();
        
        // INTERSECTION/CROSSING handling for connections and lines
        //
        this.linesToRepaintAfterDragDrop =  new draw2d.util.ArrayList();
        this.lineIntersections = new draw2d.util.ArrayList();
        
        // Inform all listener that the selection has been cleanup. Normally this will be done
        // by the edit policies of the canvas..but exceptional this is done in the clear method as well -
        // Design flaw.
        this.fireEvent("select",null);
        
        return this;
    },
    
    /**
     * @method
     * Callback for any kind of image export tools to trigger the canvas to hide all unwanted
     * decorations. The method is called e.g. from the draw2d.io.png.Writer
     * 
     * @since 4.0.0
     * @template
     */
    hideDecoration: function()
    {
    	
    },

    /**
     * @method
     * callback method for any image export writer to reactivate the decoration
     * of the canvas. e.g. grids, rulers,...
     * 
     * 
     * @since 4.0.0
     * @template
     */
    showDecoration: function()
    {
    	
    },

    /**
     * @method
     * Calculate all connection intersection of the canvas.
     * Required for "bridging" or "crossing decoration"
     * 
     * @private
     */
    calculateConnectionIntersection: function()
    {

        var _this = this;
        this.lineIntersections = new draw2d.util.ArrayList();
        var lines = this.getLines().clone();
        while(lines.getSize()>0){
            var l1 = lines.removeElementAt(0);
            lines.each(function(ii,l2){
                var partInter =l1.intersection(l2);
                if(partInter.getSize()>0){
                   _this.lineIntersections.add({line:l1, other:l2, intersection:partInter});
                   _this.lineIntersections.add({line:l2, other:l1, intersection:partInter});
                }
            });
        }
        
        return this;
    },


    /**
     * @method
     * 
     * Install a new selection and edit policy into the canvas
     * 
     * @since 2.2.0
     * @param {draw2d.policy.EditPolicy} policy
     */
    installEditPolicy: function(policy)
    {
        var _this = this;
        // a canvas can handle only one selection policy
        //
        if(policy instanceof draw2d.policy.canvas.SelectionPolicy){
            // reset old selection before install new selection strategy
            this.getSelection().getAll().each(function(i,figure){
                figure.unselect();
            });
            
            // remove existing selection policy
            this.editPolicy.grep(function(p){
                var stay = !(p instanceof draw2d.policy.canvas.SelectionPolicy); 
                if(stay===false){
                    p.onUninstall(_this);
                }
                return stay;
            });
        }
        /*
        // only one SnapToXYZ edit policy at once
        else if (policy instanceof draw2d.policy.canvas.SnapToEditPolicy){
            // remove existing snapTo policy
            this.editPolicy.grep(function(p){
                var stay = !(p instanceof draw2d.policy.canvas.SnapToEditPolicy); 
                if(stay===false){
                    p.onUninstall(_this);
                }
                return stay;
            });
        }
        */
        else if( policy instanceof draw2d.policy.canvas.ConnectionInterceptorPolicy){
            // think about if I allow to install more than one
        }
        
        policy.onInstall(this);
        this.editPolicy.add(policy);  
        
        return this;
    },
    
    /**
     * @method
     * 
     * UnInstall the selection and edit policy from the canvas.
     * 
     * @since 2.2.0
     * @param {draw2d.policy.EditPolicy|String} policy
     */
    uninstallEditPolicy: function(policy)
    {
        if(policy===null){
            return; //silently
        }
        
        // either remove exact the policy instance...
        //
        var removed = this.editPolicy.remove(policy);
        if(removed!==null){
            removed.onUninstall(this);
        }
        else{
            // ..or all of the same class if the policy isn't installed before
            // With this kind of behaviour it is possible to deinstall all policies with
            // the same class at once
            //
            var _this = this;
            var name = (typeof policy === "string")?policy:policy.NAME;
            this.editPolicy.grep(function(p){
                if(p.NAME === name){
                    p.onUninstall(_this);
                    return false;
                }
                return true;
            });
        }
        return this;
    },
    
    getInterceptorPolicies:function()
    {
        return  this.editPolicy.clone().grep(function(p){
                   return (p instanceof  draw2d.policy.canvas.ConnectionInterceptorPolicy); 
                });
    },
    
    /**
     * @method
     * Set the new zoom factor for the canvas. The value must be between [0.01..10]
     * 
     *      // you can register an eventhandler if the zoom factor did change 
     *      canvas.on("zoom", function(emitterFigure, zoomData){
     *          alert("canvas zoomed to:"+zoomData.factor);
     *      });
     * 
     * @param {Number} zoomFactor new zoom factor.
     * @param {boolean} [animated] set it to true for smooth zoom in/out
     */
    setZoom : function(zoomFactor, animated)
    {
        var _this = this;
        var _zoom = function(z){
            _this.zoomFactor = Math.min(Math.max(0.01,z),10);
            
            var viewBoxWidth  = (_this.initialWidth*(_this.zoomFactor))|0;
            var viewBoxHeight = (_this.initialHeight*(_this.zoomFactor))|0;
            
            _this.paper.setViewBox(0, 0, viewBoxWidth, viewBoxHeight);
            
            _this.fireEvent("zoom", {factor:_this.zoomFactor});
            
            // BUG: raphael didn't handle setViewBox AND setSize correct
//            var paintArea =this.html.children(":first");
//            this.paper.setSize(this.html.width(), this.html.height());
            
            // didn't work too....   :-(
//            paintArea.width(this.initialWidth * this.zoomFactor);
//            paintArea.height(this.initialHeight * this.zoomFactor);
        };
        
       if(animated){
           var myTweenable = new Tweenable();
           myTweenable.tween({
             from:     { 'x': this.zoomFactor  },
             to:       { 'x': zoomFactor },
             duration: 300,
             easing : "easeOutSine",
             step: function (params) {
               _zoom(params.x);
             }
           });
       }
       else{
           _zoom(zoomFactor);
       }
    },

    /**
     * @method
     * Return the current zoom factor of the canvas.
     * 
     * @returns {Number}
     */
    getZoom: function()
    {
        return this.zoomFactor;
    },
    
    /**
     * @method
     * Return the dimension of the drawing area
     * 
     * @since 4.4.0
     * @returns {draw2d.geo.Rectangle}
     */
    getDimension : function()
    {
        return new draw2d.geo.Rectangle(0,0,this.initialWidth, this.initialHeight);
    },
    
    /**
     * @method
     * Tells the canvas to resize. If you do not specific any parameters 
     * the canvas will attempt to determine the height and width by the enclosing bounding box 
     * of all elements and set the dimension accordingly. If you would like to set the dimension 
     * explicitly pass in an draw2d.geo.Rectangle or an object with <b>height</b> and <b>width</b> properties.
     * 
     * @since 4.4.0
     * @param {draw2d.geo.Rectangle} [dim] the dimension to set or null for autodetect
     */
    setDimension : function(dim)
    {
        if (typeof dim === "undefined"){
            var widths  = this.getFigures().clone().map(function(f){ return f.getAbsoluteX()+f.getWidth();});
            var heights = this.getFigures().clone().map(function(f){ return f.getAbsoluteY()+f.getHeight();});
            this.initialHeight = Math.max.apply(Math,heights.asArray());
            this.initialWidth  = Math.max.apply(Math,widths.asArray());
        }
        else if(dim instanceof draw2d.geo.Rectangle){
            this.initialWidth  = dim.w;
            this.initialHeight = dim.h;
        }
        else if(typeof dim.width ==="number" && typeof dim.height ==="number"){
            this.initialWidth  = dim.width;
            this.initialHeight = dim.height;
        }
        this.html.css({"width":this.initialWidth+"px", "height":this.initialHeight+"px"});
        this.paper.setSize(this.initialWidth, this.initialHeight);
        this.setZoom(this.zoomFactor, false);
        
        return this;
    },
    
    
    
    /**
     * @method
     * Transforms a document coordinate to canvas coordinate.
     * 
     * @param {Number} x the x coordinate relative to the window 
     * @param {Number} y the y coordinate relative to the window
     * 
     * @returns {draw2d.geo.Point} The coordinate in relation to the canvas [0,0] position
     */
    fromDocumentToCanvasCoordinate : function(x, y) {
        return new draw2d.geo.Point(
                (x - this.getAbsoluteX() + this.getScrollLeft())*this.zoomFactor,
                (y - this.getAbsoluteY() + this.getScrollTop())*this.zoomFactor);
    },
  
    _fromDocumentToCanvasCoordinate_IE8_HACK : function(x, y) {
        return new draw2d.geo.Point(
                (x - this.getAbsoluteX())*this.zoomFactor,
                (y - this.getAbsoluteY())*this.zoomFactor);
    },

    /**
     * @method
     * Transforms a canvas coordinate to document coordinate.
     * 
     * @param {Number} x the x coordinate in the canvas 
     * @param {Number} y the y coordinate in the canvas
     * 
     * @returns {draw2d.geo.Point} the coordinate in relation to the document [0,0] position
     */
    fromCanvasToDocumentCoordinate : function(x,y) 
    {
        return new draw2d.geo.Point(
                ((x*(1/this.zoomFactor)) + this.getAbsoluteX() - this.getScrollLeft()),
                ((y*(1/this.zoomFactor)) + this.getAbsoluteY() - this.getScrollTop()));
    },
    
    /**
     * @method
     * The DOM host of the canvas
     * 
     * @returns {HTMLElement}
     */
    getHtmlContainer: function()
    {
       return this.html; 
    },
    
    
    /**
     * @method
     * Return a common event object independed if we run on an iPad or desktop.
     * 
     * @param event
     * @return
     * @private
     */
    _getEvent:function(event)
    {
      // check for iPad, Android touch events
      //
      if(typeof event.originalEvent !== "undefined"){  
          if(event.originalEvent.touches && event.originalEvent.touches.length) {
               return event.originalEvent.touches[0];
          } else if(event.originalEvent.changedTouches && event.originalEvent.changedTouches.length) {
               return event.originalEvent.changedTouches[0];
          }
      }
      return event;
    },

    /**
     * @method
     * 
     * Set the area which are scrolling the canvas. This can be a jquery selector or 
     * a jQuery node.
     * 
     * @param {String/HTMLElement} elementSelector
     **/
    setScrollArea:function(elementSelector)
    {
       this.scrollArea= $(elementSelector);
       
       return this;
    },

    /**
     * @method
     * 
     * return the scrolling area of the canvas. This is jQuery object
     * 
     * @return {HTMLElement} 
     **/
    getScrollArea:function()
    {
       return this.scrollArea;
    },

    /**
     * @method
     * The left scroll position.
     * 
     * @return {Number} the left scroll offset of the canvas
     **/
    getScrollLeft:function()
    {
      return this.scrollArea.scrollLeft();
    },

    /**
     * @method
     * The top scroll position
     * 
     * @return {Number} the top scroll offset of the cnavas.
     **/
    getScrollTop:function()
    {
      return this.scrollArea.scrollTop();
    },

    /**
     * @method
     * The absolute document x offset.
     *
     * @return {Number}
     **/
    getAbsoluteX:function()
    {
        return this.html.offset().left;
    },

    /**
     * @method
     * The absolute document y offset.
     * 
     * @return {Number} 
     **/
    getAbsoluteY:function()
    {
      return this.html.offset().top;
    },


    /**
     * @method
     * Return the width of the canvas
     * 
     * @return {Number}
     **/
    getWidth : function()
    {
        return this.html.width();
    },


    /**
     * @method
     * Return the height of the canvas.
     * 
     * @return {Number}
     **/
    getHeight:function() 
    {
      return this.html.height();
    },
 

    /**
     * @method
     * Add a figure at the given x/y coordinate. This method fires an event.
     *
     * Example:
     * 
     *      canvas.on("figure:add", function(emitter, event){
     *         alert("figure added:");
     *      });
     *      
     *      // or more general if you want catch all figure related events
     *      //
     *      canvas.on("figure", function(emitter, event){
     *         // use event.figure.getCanvas()===null to determine if the 
     *         // figure part of the canvas
     *         
     *         alert("figure added or removed:");
     *      });
     *      
     * @param {draw2d.Figure} figure The figure to add.
     * @param {Number/draw2d.geo.Point} x The new x coordinate of the figure or the x/y coordinate if it is an draw2d.geo.Point
     * @param {Number} [y] The y position.
     **/
    add:function( figure , x,  y)
    {
        if(figure.getCanvas()===this){
            return;
        }
        
      if(figure instanceof draw2d.shape.basic.Line){
         this.lines.add(figure);
         this.linesToRepaintAfterDragDrop = this.lines;
      }
      else{
         this.figures.add(figure);
         if(typeof y !== "undefined"){
             figure.setPosition(x,y);
         }
         else if(typeof x !== "undefined"){
             figure.setPosition(x);
         }
      }
      figure.setCanvas(this);

      // important inital call
      figure.getShapeElement();

      // init a repaint of the figure. This enforce that all properties
      // ( color, dim, stroke,...) will be set.
      figure.repaint();
      // fire the figure:add event before the "move" event and after the figure.repaint() call!
      //   - the move event can only be fired if the figure part of the canvas.
      //     and in this case the notification event should be fired to the listener before
      this.fireEvent("figure:add", {figure:figure});

      // fire the event that the figure is part of the canvas
      figure.fireEvent("added");
 
      // ...now we can fire the initial move event
      figure.fireEvent("move");
      
      return this;
    },
    
    /**
     * @method
     * Deprecated since version 5.0.0
     * @deprecated use draw2d.Canvas.add() instead
     */
    addFigure: function(figure,x,y){ return this.add(figure,x,y);},
    
    
    /**
     * @method
     * Remove a figure or connection from the Canvas. This method fires an event 
     * which can be catched.
     * 
     * Example:
     * 
     *      canvas.on("figure:remove", function(emitter, event){
     *         alert("figure removed:");
     *      });
     *      
     *      // or more general if you want catch all figure related events
     *      //
     *      canvas.on("figure", function(emitter, event){
     *         // use event.figure.getCanvas()===null to determine if the 
     *         // figure part of the canvas
     *         
     *         alert("figure added or removed:");
     *      });
     *      
     *
     * @param {draw2d.Figure} figure The figure to remove
     **/
    remove:function(figure){
        // don't fire events of calll callbacks if the fire isn'T part of this canvas
        //
        if(figure.getCanvas()!==this){
            return this;
        }

        // remove the figure from a selection handler as well and cleanup the 
        // selection feedback 
        var _this = this;
        this.editPolicy.each(function(i,policy){
            if(typeof policy.unselect==="function"){
                policy.unselect(_this,figure);
            }
        });
        
        if(figure instanceof draw2d.shape.basic.Line){
           this.lines.remove(figure);
        }
        else {
           this.figures.remove(figure);
        }

        figure.setCanvas(null);

        if(figure instanceof draw2d.Connection){
           figure.disconnect();
        }
        
        this.fireEvent("figure:remove",  {figure:figure});
        
        return this;
    },
    
    /**
     * @method
     * Deprecated since 5.0.0
     * @deprecated use draw2d.Canvas.remove()
     * @param figure
     */
    removeFigure: function(figure){return this.remove(figure);},
    
    /**
     * @method
     * Returns all lines/connections in this workflow/canvas.<br>
     *
     * @protected
     * @return {draw2d.util.ArrayList}
     **/
    getLines: function()
    {
      return this.lines;
    },

    /**
     * @method
     * Returns the internal figures.<br>
     *
     * @protected
     * @return {draw2d.util.ArrayList}
     **/
    getFigures: function()
    {
      return this.figures;
    },

    /**
     * @method
     * Returns the line or connection with the given id.
     *
     * @param {String} id The id of the line.
     * 
     * @return {draw2d.shape.basic.Line}
     **/
    getLine: function( id)
    {
      var count = this.lines.getSize();
      for(var i=0; i<count;i++)
      {
         var line = this.lines.get(i);
         if(line.getId()===id){
            return line;
         }
      }
      return null;
    },

    /**
     * @method
     * Returns the figure with the given id. 
     *
     * @param {String} id The id of the figure.
     * @return {draw2d.Figure}
     **/
    getFigure:function( id)
    {
      var figure = null;
      this.figures.each(function(i,e){
          if(e.id===id){
              figure=e;
              return false;
           }
      });
      return figure;
    },

    /**
     * @method
     * Return all intersections draw2d.geo.Point between the given line and all other
     * lines in the canvas.
     * 
     * @param {draw2d.shape.basic.Line} line the line for the intersection test
     * @return {draw2d.util.ArrayList} 
     */
    getIntersection:function(line){
       var result = new draw2d.util.ArrayList();
       
       this.lineIntersections.each(function(i, entry){
           if(entry.line ===line){
               entry.intersection.each(function(i,p){
                   result.add({x:p.x, y:p.y, justTouching:p.justTouching, other:entry.other});
               });
           }
       });
       
       return result;
    },
    

    /** 
     * @method
     *  Adjust the coordinate with the installed SnapToHelper.
     *
     * @param  {draw2d.Figure} figure The related figure
     * @param  {draw2d.geo.Point} pos The position to adjust
     * 
     * @return {draw2d.geo.Point} the adjusted position
     * @private
     **/
    snapToHelper:function(figure,  pos)
    {
        var _this = this;
        var orig = pos.clone();
        this.editPolicy.each(function(i,policy){
             pos = policy.snap(_this, figure, pos, orig);
        });

        return pos;
    },


    /**
     * @method
     * Register a port to the canvas. This is required for other ports to find a valid drop target.
     * 
     * @param {draw2d.Port} port The new port which has been added to the Canvas.
     **/
    registerPort:function(port )
    {
      // All elements have the same drop targets.
      //
      if(!this.commonPorts.contains(port)){
          this.commonPorts.add(port);
      }
      
      return this;
    },

    /**
     * @method
     * Remove a port from the internal cnavas registration. Now other ports can't find the
     * port anymore as drop target. The port itself is still visible.
     * 
     * @param {draw2d.Port} p The port to unregister as potential drop target
     * @private
     **/
    unregisterPort:function(port )
    {
        this.commonPorts.remove(port);
        
        return this;
    },

    /**
     * @method
     * Return all ports in the canvas
     * 
     */
    getAllPorts: function(){
        return this.commonPorts;
    },
    
    /**
     * @method
     * Returns the command stack for the Canvas. Required for undo/redo support.
     *
     * @return {draw2d.command.CommandStack}
     **/
    getCommandStack:function()
    {
      return this.commandStack;
    },

    /**
     * @method
     * Returns the current selected figure in the Canvas.
     *
     * @return {draw2d.Figure}
     * @deprecated
     **/
    getCurrentSelection:function()
    {
      return this.selection.getPrimary();
    },
    
    /**
     * @method
     * Returns the current selection.
     *
     * @return {draw2d.Selection}
     **/
    getSelection:function()
    {
      return this.selection;
    },

    /**
     * @method
     * Set the current selected figure or figures in the canvas.<br>
     * <br>
     * You can hand over a draw2d.util.ArrayList since version 4.8.0 for multiple selection.
     * 
     * @param {draw2d.Figure| draw2d.util.ArrayList} object The figure or list of figures to select.
     **/
    setCurrentSelection:function( object )
    {
        var _this = this;
   
        // multiple selection
        if(object instanceof draw2d.util.ArrayList){
            this.selection.each(function(i,e){
                _this.editPolicy.each(function(i,policy){
                    if(typeof policy.unselect==="function"){
                        policy.unselect(_this,e);
                    }
                });
            });
            this.addSelection(object);
        }
        // single selection
        else{
            var figure = object;
            this.selection.getAll().each(function(i,e){
                _this.editPolicy.each(function(i,policy){
                    if(typeof policy.unselect==="function"){
                        policy.unselect(_this,e);
                    }
                });
            });
     
            this.editPolicy.each(function(i,policy){
                if(typeof policy.select==="function"){
                    policy.select(_this,figure);
                }
            });            
        }

        
        return this;
    },

    /**
     * @method
     * Add the current figure to the selection. If a single selection policy is installed in the
     * canvas the selection before is reseted and the figure is the one and only selection.
     *
     * @param {draw2d.Figure| draw2d.util.ArrayList} object The figure(s) to add to the selection
     * @since 4.6.0
     **/
    addSelection:function( object )
    {
        var _this = this;

        var add = function(i, figure){
            _this.editPolicy.each(function(i,policy){
                if(typeof policy.select==="function"){
                    policy.select(_this,figure);
                }
            });            
        };
        
        if(object instanceof draw2d.util.ArrayList){
            object.each(add);
        }
        else{
            add(0,object);
        }
        
        return this;

    },

    
    /**
     * @method
     * Register a listener to the Canvas. The listener must provide a function "onSelectionChanged".
     * 
      *      // since version 5.0.0 use this method to register an listener
      *      //
      *      canvas.on("select", function(canvas, selectedFigureOrNull){
      *          alert("object selected/unselected");
      *      });
      * 
     * @param {Object/Function} w an object which implements the 'onSelectionChanged' method or a callback function
     * @deprecated use draw2d.Canvas.on() instead
     **/
    addSelectionListener:function(w)
    {
      if(w!==null)
      {
        if(typeof w ==="function"){
          this.on("select", w);
        } 
        else if(typeof w.onSelectionChanged==="function"){
          this.on("select", $.proxy(w.onSelectionChanged,w));
        }
        else{
          throw "Object doesn't implement required callback method [onSelectionChanged]";
        }
      }
      
      return this;
    },

    /**
     * @method
     * unregister the listener from the canvas.
     * 
     * @param {Object/Function} w The object which will be removed from the selection eventing
     * @deprecated use draw2d.Canvas.off() instead
     **/
    removeSelectionListener: function(/*:Object*/ w )
    {
      this.off("select",w);
      
      return this;
    },


    /**
     * @method
     * Returns the best figure at the location [x,y]. It is a simple hit test. Keep in mind that only visible objects 
     * are returned.
     *
     * @param {Number} x The x position.
     * @param {Number} y The y position.
     * @param {draw2d.Figure|Array} [figureToIgnore] The figures which should be ignored.
     **/
    getBestFigure: function(x, y, figureToIgnore)
    {
    	if(!$.isArray(figureToIgnore)){
    		if(figureToIgnore instanceof draw2d.Figure){
    			figureToIgnore = [figureToIgnore];
    		}
    		else{
    			figureToIgnore = [];
    		}
    	}
    	
        var result = null;
        var testFigure = null;

        var contains = function(testFigure, figuresToCheck){
            var i,len; // inner function scope of vars. take care about this and don't ove them outside
            for(i=0,len=figuresToCheck.length; i<len;i++){
                if(figuresToCheck[i]===testFigure || figuresToCheck[i].contains(testFigure)){
                    return true;
                }
            }
            return false;
        };

        // ResizeHandles first
        //
        var i,len;
        for ( i = 0, len = this.resizeHandles.getSize(); i < len; i++) {
            testFigure = this.resizeHandles.get(i);
            if (testFigure.isVisible()===true && testFigure.hitTest(x, y) === true && contains(testFigure, figureToIgnore)===false){
                return testFigure; 
            }
        }

        // tool method to check recursive a figure for hitTest
        //
        var checkRecursive = function(children){
            children.each(function(i,e){
                var c=e.figure;
                checkRecursive(c.children);
                if(result===null && c.isVisible()===true && c.hitTest(x,y)===true && contains(c, figureToIgnore)===false){
                    result = c;
                }
                return result===null; // break the each-loop if we found an element
            });
        };

        // Checking ports
        //
        for ( i = 0, len = this.commonPorts.getSize(); i < len; i++) {
            port = this.commonPorts.get(i);
            // check first a children of the figure
            //
            checkRecursive( port.children);

            if(result===null && port.isVisible()===true && port.hitTest(x, y) === true && contains(port, figureToIgnore)===false){
               result = port;
            }
            
            if(result !==null){
                return result;
            }
        }


        //  Check now the common objects.
        //  run reverse to aware the z-oder of the figures
        for ( i = (this.figures.getSize()-1); i >=0; i--)
        {
            var figure = this.figures.get(i);
            // check first a children of the figure
            //
            checkRecursive( figure.children);
            
            // ...and the figure itself
            //
            if (result ===null && figure.isVisible()===true && figure.hitTest(x, y) === true && contains(figure, figureToIgnore)===false) {
                result = figure;
            }

            if(result !==null){
                return result;
            }
        }
        
        // Check the children of the lines as well
        // Not selectable/draggable. But should receive onClick/onDoubleClick events 
        // as well.
        var count = this.lines.getSize();
        for(i=0;i< count;i++)
        {
          var line = this.lines.get(i);
          // check first a children of the figure
          //
          checkRecursive( line.children);
          
          if(result !==null){
              return result;
          }
        }
        
        // A line is the last option in the priority queue for a "Best" figure
        //
        result = this.getBestLine(x,y,figureToIgnore);
        if(result !==null){
            return result;
        }

       return result;
    },


    /**
     * @method
     * Return the line which match the hands over coordinate
     *
     * @param {Number} x the x-coordinate for the hit test
     * @param {Number} y the x-coordinate for the hit test
     * @param {draw2d.shape.basic.Line} [lineToIgnore] a possible line which should be ignored for the hit test
     *
     * @private
     * @return {draw2d.shape.basic.Line}
     **/
    getBestLine:function( x,  y,  lineToIgnore)
    {
    	if(!$.isArray(lineToIgnore)){
    		if(lineToIgnore instanceof draw2d.Figure){
    			lineToIgnore = [lineToIgnore];
    		}
    		else{
    			lineToIgnore=[];
    		}
    	}
    	var count = this.lines.getSize();

	    for(var i=0;i< count;i++)
	    {
	      var line = this.lines.get(i);
	      if(line.isVisible()===true && line.hitTest(x,y)===true  && $.inArray(line, lineToIgnore)===-1)
	      {
	          return line;
	      }
	    }
	    return null;
    }, 

    
    /**
     * @method
     * Called by the framework during drag&drop operations.<br>
     * Droppable can be setup with:
     * <pre>
     *     $(".draw2d_droppable").draggable({
     *          appendTo:"#container",
     *          stack:"#container",
     *          zIndex: 27000,
     *          helper:"clone",
     *          start: function(e, ui){$(ui.helper).addClass("shadow");}
     *     });
     * </pre>
     * Graphiti use the jQuery draggable/droppable lib. Please inspect
     * http://jqueryui.com/demos/droppable/ for further information.
     * 
     * @param {HTMLElement} draggedDomNode The DOM element which is currently dragging
     * 
    * @template
     **/
    onDragEnter : function( draggedDomNode )
    {
    },
 
    
    /**
     * @method
     * Called if the DragDrop object is moving around.<br>
     * <br>
     * Graphiti use the jQuery draggable/droppable lib. Please inspect
     * http://jqueryui.com/demos/droppable/ for further information.
     * 
     * @param {HTMLElement} draggedDomNode The dragged DOM element.
     * @param {Number} x the x coordinate of the drag
     * @param {Number} y the y coordinate of the drag
     * 
     * @template
     **/
    onDrag:function(draggedDomNode, x, y )
    {
    },

        
    /**
     * @method
     * Called if the DragDrop object leaving the current hover figure.<br>
     * <br>
     * Graphiti use the jQuery draggable/droppable lib. Please inspect
     * http://jqueryui.com/demos/droppable/ for further information.
     * 
     * @param {HTMLElement} draggedDomNode The figure which is currently dragging
     * 
     * @template
     **/
    onDragLeave:function( draggedDomNode )
    {
    },

    
    /**
     * @method
     * Called if the user drop the droppedDomNode onto the canvas.<br>
     * <br>
     * Draw2D use the jQuery draggable/droppable lib. Please inspect
     * http://jqueryui.com/demos/droppable/ for further information.
     * 
     * @param {HTMLElement} droppedDomNode The dropped DOM element.
     * @param {Number} x the x-coordinate of the mouse up event
     * @param {Number} y the y-coordinate of the mouse up event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     * 
     * @template
     **/
    onDrop:function(droppedDomNode, x, y, shiftKey, ctrlKey)
    {
    },
    

    /**
     * @method
     * Callback method for the double click event. The x/y coordinates are relative to the top left
     * corner of the canvas.
     * 
     * @private
     **/
    onDoubleClick : function(x, y, shiftKey, ctrlKey)
    {
        this.fireEvent("dblclick",  {x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        
        // check if a line has been hit
        //
        var figure = this.getBestFigure(x, y);

        if(figure!==null){
            figure.fireEvent("dblclick", {x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
            figure.onDoubleClick();
        }
        
        // forward the event to all install policies as well.
        // (since 4.0.0)
        this.editPolicy.each(function(i,policy){
            policy.onDoubleClick(figure, x,y, shiftKey, ctrlKey);
        });
    },

    /**
     * 
     * @param {Number} x the x coordinate of the event
     * @param {Number} y the y coordinate of the event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     * @private
     **/
    onClick : function(x, y, shiftKey, ctrlKey)
    {
        this.fireEvent("click", {x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        
        // check if a figure has been hit
        //
        var figure = this.getBestFigure(x, y);
        
        // or a line/connection. May we should test the line before a figure..?
        // (since 4.0.0)
        if(figure===null){
            figure = this.getBestLine(x,y);
        }
        
        if(figure!==null){
            figure.fireEvent("click", {x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey}); // since 5.0.0
            figure.onClick();          // backward compatiblity 
        }
        
        // forward the event to all install policies as well.
        // (since 3.0.0)
        this.editPolicy.each(function(i,policy){
            policy.onClick(figure, x, y, shiftKey, ctrlKey);
        });

    },

    /**
     * @method
     * The user has triggered a right click. Redirect them to a responsible figure. 
     * 
     * @param {Number} x The x-coordinate of the click
     * @param {Number} y The y-coordinate of the click
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     * 
     * @private
     * @since 1.1.0
     **/
    onRightMouseDown : function(x, y, shiftKey, ctrlKey)
    {
        this.fireEvent("contextmenu",  {x:x, y:y, shiftKey:shiftKey, ctrlKey:ctrlKey});
        
        var figure = this.getBestFigure(x, y);
        if(figure!==null){
            figure.fireEvent("contextmenu", {x:x,y:y});
            figure.onContextMenu(x,y);
            
            // forward the event to all installed policies of the figure
            // soft migration from onHookXYZ to Policies.
            // since 4.4.0
            figure.editPolicy.each(function(i,policy){
                policy.onRightMouseDown(figure, x, y, shiftKey, ctrlKey);
            });
        }
        
        // forward the event to all install policies as well.
        // (since 4.4.0)
        this.editPolicy.each(function(i,policy){
            policy.onRightMouseDown(figure, x, y, shiftKey, ctrlKey);
        });

    },
    
    // NEW EVENT HANDLING SINCE VERSION 5.0.0
    /**
     * @method
     * Execute all handlers and behaviors attached to the canvas for the given event type.
     * 
     * 
     * @param {String} event the event to trigger
     * @param {Object} [args] optional parameters for the triggered event callback
     * 
     * @since 5.0.0
     */
    fireEvent: function(event, args) {
        if (typeof this.eventSubscriptions[event] === 'undefined') {
            return;
        }
        
        var subscribers = this.eventSubscriptions[event];
        for (var i=0; i<subscribers.length; i++) {
            try{
                subscribers[i](this, args);
            }
            catch(exc){
                console.log(exc);
                console.log(subscribers[i]);
            }
        }
    },
    
    /**
     * @method
     * Attach an event handler function for one or more events to the canvas.
     * To remove events bound with .on(), see {@link #off}.
     * 
     * possible events are:<br>
     * <ul>
     *   <li>reset</li>
     *   <li>select</li>
     * </ul>
     * 
     * Example:
     * 
     *      canvas.on("clear", function(emitter){
     *         alert("canvas.clear() called.");
     *      });
     *      
     *      canvas.on("select", function(emitter,figure){
     *          if(figure!==null){
     *              alert("figure selected");
     *          }
     *          else{
     *              alert("selection cleared");
     *          }
     *      });
     *      
     * @param {String}   event One or more space-separated event types
     * @param {Function} callback A function to execute when the event is triggered. 
     * @param {draw2d.Canvas} callback.emitter the emitter of the event
     * @param {Object} [callback.obj] optional event related data
     * 
     * @since 5.0.0
     */
    on: function(event, callback) {
        var events = event.split(" ");
        for(var i=0; i<events.length; i++){
            if (typeof this.eventSubscriptions[events[i]] === 'undefined') {
                this.eventSubscriptions[events[i]] = [];
            }
            this.eventSubscriptions[events[i]].push(callback);
        }
        return this;
    },
    
    /**
     * @method
     * The .off() method removes event handlers that were attached with {@link #on}.<br>
     * Calling .off() with no arguments removes all handlers attached to the canvas.<br>
     * <br>
     * If a simple event name such as "reset" is provided, all events of that type are removed from the canvas. 
     * 
     * 
     * @param {String|Function} eventOrFunction the event name of the registerd function
     * @since 5.0.0
     */
    off: function( eventOrFunction){
        if(typeof eventOrFunction ==="undefined"){
            this.eventSubscriptions = {};
        }
        else if( typeof eventOrFunction === 'string'){
            this.eventSubscriptions[eventOrFunction] = [];
        }
        else{
            for(var event in this.eventSubscriptions ){
                this.eventSubscriptions[event] =$.grep(this.eventSubscriptions[event], function( callback ) { return callback !== eventOrFunction; });
            }
        }

        return this;
    }
});