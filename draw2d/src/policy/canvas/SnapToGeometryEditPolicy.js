/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/

/**
 * @class draw2d.policy.canvas.SnapToGeometryEditPolicy
 * 
 * Snapping is based on the existing children of a container. When snapping a shape, 
 * the edges of the bounding box will snap to edges of other rectangles generated 
 * from the children of the given canvas. 
 * 
 * 
 * @author Andreas Herz
 * 
 * @extends draw2d.policy.canvas.SnapToEditPolicy
 */
draw2d.policy.canvas.SnapToGeometryEditPolicy = draw2d.policy.canvas.SnapToEditPolicy.extend({

    NAME : "draw2d.policy.canvas.SnapToGeometryEditPolicy",
    
    SNAP_THRESHOLD   : 3,
    FADEOUT_DURATION : 300,
    
    /**
     * @constructor 
     * Creates a new constraint policy for snap to geometry
     * 
     */
    init: function( attr, setter, getter){
        this.lineColor = null;

        this._super(
            $.extend({
                lineColor: "#1387E6"
            },attr),
            $.extend({
                /** @attr {draw2d.util.Color} color the line color of the snapTo lines */
                lineColor : this.setLineColor
            }, setter),
            $.extend({
                lineColor : this.getLineColor
            }, getter));

        this.rows=null;
        this.cols=null;
        this.vline = null;
        this.hline = null;
        this.canvas = null;
    },


    /**
     * @method
     * Set the color of the snap line.
     *
     *      // Alternatively you can use the attr method:
     *      policy.attr({
     *        lineColor: color
     *      });
     *
     * @param {draw2d.util.Color|String} color The new color of the line.
     **/
    setLineColor:function( color)
    {
        this.lineColor = new draw2d.util.Color(color);
        return this;
    },

    /**
     * @method
     * Return the current paint color.
     *
     * @return {draw2d.util.Color} The paint color of the line.
     * @since 5.6.1
     **/
    getLineColor:function()
    {
        return this.lineColor;
    },


    onInstall: function(canvas)
    {
        this.canvas = canvas;
    },
    
    onUninstall: function(canvas)
    {
        this.canvas = null;
    },
    
    /**
     * @method
     * 
     * @param {draw2d.Canvas} canvas
     * @param {Number} x the x-coordinate of the mouse down event
     * @param {Number} y the y-coordinate of the mouse down event
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     * @template
     */
    onMouseUp: function(figure, x, y, shiftKey, ctrlKey)
    {
        this.rows=null;
        this.cols=null;
        this.hideVerticalLine();
        this.hideHorizontalLine();
    },
    
    /**
     * @method
     * Adjust the coordinates to the canvas neighbours
     *
     * @param canvas the related canvas
     * @param figure the figure to snap
     * @param {draw2d.geo.Point} pos
     *
     * @returns {draw2d.geo.Point} the constraint position of the figure
     */
    snap: function(canvas, figure, pos, origPos)
    {

        var allowXChanges = pos.x=== origPos.x;
        var allowYChanges = pos.y=== origPos.y;

        // Coordinates already snapped to an x/y coordinate.
        // Don't change them and in this case no further calculation is requried.
        //
        if(!allowXChanges && !allowYChanges){
            return pos;
        }

        if(figure instanceof draw2d.ResizeHandle)
        {
           var snapPoint = figure.getSnapToGridAnchor();
           pos.x+= snapPoint.x;
           pos.y+= snapPoint.y;

           var snapDirections = figure.getSnapToDirection();
           var result = this.snapPoint(snapDirections, pos);

           // Show a vertical line if the snapper has modified the inputPoint
           //
           if(allowXChanges && (snapDirections & draw2d.SnapToHelper.EAST_WEST) && !(result.edge & draw2d.SnapToHelper.EAST_WEST)) {
               this.showVerticalLine(figure, draw2d.SnapToHelper.WEST, result.point.x);
           }
           else {
               this.hideVerticalLine();
           }

           // Show a horizontal line if the snapper has modified the inputPoint
           //
           if(allowYChanges && (snapDirections & draw2d.SnapToHelper.NORTH_SOUTH) && !(result.edge & draw2d.SnapToHelper.NORTH_SOUTH)) {
               this.showHorizontalLine(figure, draw2d.SnapToHelper.NORTH, result.point.y);
           }
           else {
               this.hideHorizontalLine();
           }

           // restore the original pos coordinate if x or y coordinate already snapped to any axis
           // or subtract the added snapOffset
            //
           result.point.x= allowXChanges? result.point.x-snapPoint.x: pos.x;
           result.point.y= allowYChanges? result.point.y-snapPoint.y: pos.y;

           return result.point;
        }

        // The user drag&drop a normal figure
        var inputBounds = new draw2d.geo.Rectangle(pos.x,pos.y, figure.getWidth(), figure.getHeight());

        var result = this.snapRectangle( inputBounds);

        if(!allowXChanges){
            result.bounds.x= pos.x;
        }

        if(!allowYChanges){
            result.bounds.y=pos.y;
        }

        // Show a vertical line if the snapper has modified the inputPoint
        //
        if(allowXChanges && !(result.edge & draw2d.SnapToHelper.WEST)) {
            this.showVerticalLine(figure, draw2d.SnapToHelper.WEST, result.bounds.x);
        }
        else if(allowXChanges && ! (result.edge & draw2d.SnapToHelper.EAST)) {
            this.showVerticalLine(figure, draw2d.SnapToHelper.EAST, result.bounds.x + result.bounds.getWidth());
        }
        else {
            this.hideVerticalLine();
        }


        // Show a horizontal line if the snapper has modified the inputPoint
        //
        if(allowYChanges && !(result.edge & draw2d.SnapToHelper.NORTH)) {
            this.showHorizontalLine(figure, draw2d.SnapToHelper.NORTH, result.bounds.y);
        }
        else if(allowYChanges && !(result.edge & draw2d.SnapToHelper.SOUTH)) {
            this.showHorizontalLine(figure, draw2d.SnapToHelper.SOUTH, result.bounds.y + result.bounds.getHeight());
        }
        else {
            this.hideHorizontalLine();
        }

        return result.bounds.getTopLeft();
    },

    /**
     * @method
     * calculates the snapped position of the rectangle.
     *
     * @param {draw2d.geo.Rectangle} inputBounds
     * @param {draw2d.geo.Rectangle} resultBounds
     * @returns {number}
     */
    snapRectangle:function(inputBounds)
    {
        var resultBounds = inputBounds.clone();

        var topLeft = this.snapPoint(draw2d.SnapToHelper.NORTH_WEST, inputBounds.getTopLeft());
        resultBounds.x = topLeft.point.x;
        resultBounds.y = topLeft.point.y;

        var bottomRight = this.snapPoint(draw2d.SnapToHelper.SOUTH_EAST, inputBounds.getBottomRight());

        // The first test (topLeft) has not modified the point. so we can modify them with the bottomRight adjustment
        //
        if(topLeft.edge & draw2d.SnapToHelper.WEST) {
            resultBounds.x = bottomRight.point.x - inputBounds.getWidth();
        }

        // The first test (topLeft) has not modified the point. so we can modify them with the bottomRight adjustment
        //
        if(topLeft.edge & draw2d.SnapToHelper.NORTH) {
            resultBounds.y = bottomRight.point.y - inputBounds.getHeight();
        }

        return {edge: topLeft.edge|bottomRight.edge , bounds:resultBounds};
    },
    
    snapPoint:function(/*:int*/ snapOrientation, /*:draw2d.Point*/ inputPoint)
    {
        var resultPoint = inputPoint.clone();

       if(this.rows===null || this.cols===null)
         this.populateRowsAndCols();

       if ((snapOrientation & draw2d.SnapToHelper.EAST) !== 0) 
       {
          var rightCorrection = this.getCorrectionFor(this.cols, inputPoint.x -1, 1);
          if (rightCorrection !== this.SNAP_THRESHOLD) 
          {
             snapOrientation &= ~draw2d.SnapToHelper.EAST;
             resultPoint.x += rightCorrection;
          }
       }

       if ((snapOrientation & draw2d.SnapToHelper.WEST) !== 0) 
       {
          var leftCorrection = this.getCorrectionFor(this.cols, inputPoint.x, -1);
          if (leftCorrection !== this.SNAP_THRESHOLD) 
          {
             snapOrientation &= ~draw2d.SnapToHelper.WEST;
             resultPoint.x += leftCorrection;
          }
       }

       if ((snapOrientation & draw2d.SnapToHelper.SOUTH) !== 0) 
       {
          var bottomCorrection = this.getCorrectionFor(this.rows,  inputPoint.y - 1, 1);
          if (bottomCorrection !== this.SNAP_THRESHOLD) 
          {
             snapOrientation &= ~draw2d.SnapToHelper.SOUTH;
             resultPoint.y += bottomCorrection;
          }
       }

       if ((snapOrientation & draw2d.SnapToHelper.NORTH) !== 0) 
       {
          var topCorrection = this.getCorrectionFor(this.rows, inputPoint.y, -1);
          if (topCorrection !== this.SNAP_THRESHOLD) 
          {
             snapOrientation &= ~draw2d.SnapToHelper.NORTH;
             resultPoint.y += topCorrection;
          }
       }

       return {edge: snapOrientation, point: resultPoint};
    },
    
    populateRowsAndCols:function()
    {
       var selection = this.canvas.getSelection();
       this.rows = [];
       this.cols = [];
       
       var figures = this.canvas.getFigures();
       for (var i = 0; i < figures.getSize();i++ )
       {
          var figure = figures.get(i);
          if(!selection.contains(figure))
          {
             var bounds = figure.getBoundingBox();
             this.cols.push({type:-1, location: bounds.x});
             this.cols.push({type:0 , location: bounds.x + (bounds.w - 1) / 2});
             this.cols.push({type:1 , location: bounds.getRight() - 1});
             this.rows.push({type:-1, location: bounds.y});
             this.rows.push({type:0 , location: bounds.y + (bounds.h - 1) / 2});
             this.rows.push({type:1 , location: bounds.getBottom() - 1});
         }
       }

       // TODO: remove duplicate entries in the rows/cols array

    },

    getCorrectionFor:function(/*:Array*/ entries, /*:double*/ value, /*:int*/ side) 
    {
       var resultMag = this.SNAP_THRESHOLD;
       var result = this.SNAP_THRESHOLD;

       for (var i = 0; i < entries.length; i++) 
       {
          var entry = entries[i];
          var magnitude;

          if (entry.type === -1 && side !== 0) 
          {
             magnitude = Math.abs(value - entry.location);
             if (magnitude < resultMag)
             {
                   resultMag = magnitude;
                   result = entry.location - value;
             }
          }
          else if (entry.type === 0 && side === 0) 
          {
             magnitude = Math.abs(value - entry.location);
             if (magnitude < resultMag)
             {
                resultMag = magnitude;
                result = entry.location - value;
             }
          }
          else if (entry.type === 1 && side !== 0) 
          {
             magnitude = Math.abs(value - entry.location);
             if (magnitude < resultMag)
             {
                resultMag = magnitude;
                result = entry.location - value;
             }
          }
       }
       return result;
    },
    
    showVerticalLine:function(causedFigure, edge, x)
    {
        if(this.vline!=null){
            this.vline.stop();
            this.vline.remove();
        }

        var figures = this.canvas.getFigures().clone();
        figures.removeAll(this.canvas.getSelection().getAll());
        figures.map(function(figure){
            return figure.getBoundingBox();
        });
        figures.grep(function(bbox){
            return (Math.abs(bbox.x-x)<=1) || (Math.abs(bbox.getRight()-x)<=1);
        });

        // figure to align is above the current shape
        //
        var causedBox  = causedFigure.getBoundingBox();
        var causedCenter  = causedBox.getCenter();
        figures.sort(function(a,b){
            var d_a = a.getCenter().getDistance(causedCenter);
            var d_b = b.getCenter().getDistance(causedCenter);
            return d_a-d_b;
        });
        var fromY = 0;
        var yLength  = maxLength = this.canvas.getHeight()*Math.max(1,this.canvas.getZoom());
        var snappedBox = figures.get(0);
        if(causedBox.y <snappedBox.y){
            fromY   = causedBox.y;
            yLength = snappedBox.getBottom()-causedBox.y;
        }
        else{
            fromY   = snappedBox.y;
            yLength = causedBox.getBottom()-snappedBox.y;
        }

        x=(x|0)+0.5; // force a .5 number to avoid subpixel rendering. Blurry lines...
        this.canvas.paper.setStart();
        this.canvas.paper.path("M " + x + " 0 l 0 " + maxLength)
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});
        this.canvas.paper.path("M " + x + " "+fromY+" l 0 " + yLength)
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});

        this.vline = this.canvas.paper.setFinish();
        this.vline.toBack();
    },
    
    hideVerticalLine:function()
    {
        if(this.vline==null){
            return;
        }
        this.vline.animate(
            {opacity: 0.1},
            this.FADEOUT_DURATION,
            $.proxy(function(){
                if(this.vline!==null) {
                    this.vline.remove();
                    this.vline = null;
                }
            },this)
        );
    },
    
    showHorizontalLine:function(causedFigure, edge, y)
    {
        if(this.hline!=null){
            this.hline.stop();
            this.hline.remove();
        }

        var figures = this.canvas.getFigures().clone();
        figures.removeAll(this.canvas.getSelection().getAll());
        figures.map(function(figure){
            return figure.getBoundingBox();
        });
        figures.grep(function(bbox){
            return (Math.abs(bbox.y-y)<=1) || (Math.abs(bbox.getBottom()-y)<=1);
        });

        // figure to align is above the current shape
        //
        var causedBox  = causedFigure.getBoundingBox();
        var causedCenter  = causedBox.getCenter();
        figures.sort(function(a,b){
            var d_a = a.getCenter().getDistance(causedCenter);
            var d_b = b.getCenter().getDistance(causedCenter);
            return d_a-d_b;
        });
        var fromX = 0;
        var xLength  = maxLength = this.canvas.getWidth()*Math.max(1,this.canvas.getZoom());
        var snappedBox = figures.get(0);
        if(causedBox.x <snappedBox.x){
            fromX   = causedBox.x;
            xLength = snappedBox.getRight()-causedBox.x;
        }
        else{
            fromX   = snappedBox.x;
            xLength = causedBox.getRight()-snappedBox.x;
        }


        y=(y|0)+0.5; // force a .5 number to avoid subpixel rendering. Blurry lines...

        this.canvas.paper.setStart();
        this.canvas.paper.path("M 0 "+y+ " l " + maxLength+" 0")
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1, "stroke-dasharray":". "});
        this.canvas.paper.path("M "+fromX+" " + y + " l " + xLength + " 0")
            .attr({"stroke":this.lineColor.hash(),"stroke-width":1});

        this.hline = this.canvas.paper.setFinish();
        this.hline.toBack();

    },

    hideHorizontalLine:function()
    {
        if(this.hline==null){
            return; //silently
        }
        this.hline.animate(
            {opacity: 0.1},
            this.FADEOUT_DURATION,
            $.proxy(function(){
                if(this.hline!==null) {
                    this.hline.remove();
                    this.hline = null;
                }
            },this)
        );
    }
    
});