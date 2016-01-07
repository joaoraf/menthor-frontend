function extend(Child, Parent) {
  var parent = new Parent();
  Child.prototype = parent;
  Child.prototype.$super = parent;
  Child.prototype.constructor = Child
}

function stereotypeByName(stereotypes, name){
	var result = null
	_.each(stereotypes, function(s){
		if(s.name===name) {
			result = s.stereotype;
		}
	});
	return result;
}

function nameByStereotype(stereotypes, stereotype){
	_.each(stereotype, function(s){
		if(s.stereotype == stereotype) return s.name;
	});
	return null;
}

function remove(array, item) {
  for(var i = array.length; i--;) {
	  if(array[i] === item) {
		  array.splice(i, 1);
	  }
  }
}
  
function inArray(array, elem){
	_.each(array, function(x){
		if(x===elem) return true;
	})
	return false;
}

function sortNumber(a,b) {
	return a - b;
}

function sortNumericalArray(numArray){
	numArray.sort(sortNumber);	
	return numArray
}

function pushAll(array, newarray){
	array.push.apply(array, newarray);
	return array;
}

function midPoint(linkView){
	if(linkView==null && _.isEmpty(linkView)) return {x: 10, y: 10};
	var segments = lineSegments(linkView);
	var midIdx = Math.floor(segments.length/2);
	var midPoint = segments[midIdx].midpoint();
	return midPoint;					
}

function lineSegments(linkView){
	var points = []
	points = points.concat(sourcePoint(linkView));
	if(linkView.model.get('vertices')!=null && linkView.model.get('vertices').length>0) { points = points.concat(linkView.model.get('vertices')); }
	points = points.concat(targetPoint(linkView));
	var segments = []
	var idx = 0;
	for(idx = 1; idx < points.length; idx++){
		var start = points[idx-1];
		var end = points[idx];
		var line = g.line(start, end);
		segments.push(line);
	};	
	return segments;
}

/** Get source point of a link view */
function sourcePoint(linkView){
	var link = linkView.model;
	var sourcePoint = linkView.getConnectionPoint('source', link.get('source'), _.first(link.get('vertices')) || link.get('target'));
	return sourcePoint;
}

/** Get target point of a link view */
function targetPoint(linkView){
	var link = linkView.model;
	var targetPoint = linkView.getConnectionPoint('target', link.get('target'), _.last(link.get('vertices')) || link.get('source'));
	return targetPoint;
}	

/** start point of a node (i.e. the top left point) */
function startPoint(node){
	return node.get('position')
}

/** end point of a noide (i.e. the bottom right point) */
function endPoint(node){
	return { x: startPoint(node).x + node.get('size').width, y: startPoint(node).y + node.get('size').height };
}

/** center point of a node */
function centerPoint(node){
	var centerX = startPoint(node).x+((endPoint(node).x - startPoint(node).x)/2);
	var centerY = startPoint(node).y+((endPoint(node).y - startPoint(node).y)/2);
	return { x:centerX, y: centerY };
}

/** checks if the line axis1start-axis1end and axis2start-axis2end have intersection. 
  * we can call for instance axisOverlapes(1,5,4,8) on X-axis and the result must be true since line x=1 to x=5 overlaps with line x=4 to x=8.
  */
function axisOverlaps(axis1start,axis1end,axis2start,axis2end) {
    return ((axis1start >= axis2start && axis1start <= axis2end) ||
           (axis1end >= axis2start && axis1end <= axis2end) ||
           (axis2start >= axis1start && axis2start <= axis1end) ||
           (axis2end >= axis1start && axis2end <= axis1end));
}

/** I knew of the 'bearing()' method but I it did not give what I wanted.
  * this method checks the direction between a node to another node. 
  * if source is below the target, than the direction is South to North and so on.
  */
function getDirectionFromTo(node1, node2){
    var node1x1 = startPoint(node1).x;
    var node1y1 = startPoint(node1).y;
    var node1x2 = endPoint(node1).x;
    var node1y2 = endPoint(node1).y;
    var node2x1 = startPoint(node2).x;
    var node2y1 = startPoint(node2).y;
    var node2x2 = endPoint(node2).x; 
    var node2y2 = endPoint(node2).y;
    var node1x = centerPoint(node1).x;
    var node1y = centerPoint(node1).y;
    var node2x = centerPoint(node2).x;
    var node2y = centerPoint(node2).y;
    if (node2x >= node1x && axisOverlaps(node1y1, node1y2, node2y1, node2y2)) return 'W_E';
    if (node1x >  node2x && axisOverlaps(node1y1, node1y2, node2y1, node2y2)) return 'E_W';    
    if (node2y >= node1y && axisOverlaps(node1x1, node1x2, node2x1, node2x2)) return 'N_S';
    if (node1y >  node2y && axisOverlaps(node1x1, node1x2, node2x1, node2x2)) return 'S_N';
    if (node2x >  node1x && node2y > node1y) return 'NW_SE';
    if (node1x >  node2x && node1y > node2y) return 'SE_NW';
    if (node2x >  node1x && node2y < node1y) return 'SW_NE';
    return 'NE_SW';
}

function linkDirection(link){
	var node1 = graph.getCell(link.get('source').id);
	var node2 = graph.getCell(link.get('target').id);
	var direction = getDirectionFromTo(node1, node2);
	return direction;
}