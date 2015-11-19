// declare the namespace for this example
var menthor = {};

/**
 * 
 * The **GraphicalEditor** is responsible for layout and dialog handling.
 * 
 * @author Andreas Herz
 * @extends draw2d.ui.parts.GraphicalEditor
 */
menthor.Application = Class.extend(
{
    NAME : "Application", 

    /**
     * @constructor
     * 
     * @param {String} canvasId the id of the DOM element to use as paint container
     */
    init : function()
    {
	      this.view    = new menthor.View("canvas");
          this.toolbar = new menthor.Toolbar("toolbar",  this.view );
	}


});
