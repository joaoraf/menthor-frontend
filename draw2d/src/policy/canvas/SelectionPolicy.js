/*****************************************
 *   Library is under GPL License (GPL)
 *   Copyright (c) 2012 Andreas Herz
 ****************************************/
/**
 * @class draw2d.policy.canvas.SelectionPolicy
 * 
 *
 * @author Andreas Herz
 * @extends draw2d.policy.canvas.CanvasPolicy
 */
draw2d.policy.canvas.SelectionPolicy = draw2d.policy.canvas.CanvasPolicy.extend({

    NAME : "draw2d.policy.canvas.SelectionPolicy",
    
    /**
     * @constructor 
     * Creates a new selection policy
     */
    init: function(){
        this._super();
    },
 

    /**
     * @method
     * Unselect the given figure in the canvas and remove all resize handles
     * 
     * @param {draw2d.Canvas} canvas
     * @param {draw2d.Figure} figure
     */
    unselect: function(canvas, figure){
        canvas.getSelection().remove(figure);

        figure.unselect();

        canvas.fireEvent("select",null);
   }

});
