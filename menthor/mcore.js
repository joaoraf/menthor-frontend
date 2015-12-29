
/** ===========================
  * MCore - Abstract Syntax
  * 
  * There is no good solution in javascript to subclassing arrays. 
  * That's why we replicated the arrays in some leafs of the hierarchy.
  * =========================== */

MElement.counter = 0; //generate unique identifier to elements

function MElement(){	
	MElement.counter++;		
	this.id = MElement.counter;
}

extend(MNamedElement, MElement);
function MNamedElement(){
	this.name = ''
	this.uniqueName = null
	this.text = null
	this.definitions = []
	this.synonyms = [] 
}

extend(MType, MNamedElement);
function MType() {
	this.attributes = []
	this.isAbtract = false	
}

extend(MClass, MType);
function MClass(){
	this.name = "Class"	
	
	this.attributes = [] //this meta-attribute should be inherited from MType but it is not
	this.definitions = [] //this meta-attribute should be inherited from MNamedElement but it is not
	this.synonyms = [] //this meta-attribute should be inherited from MNamedElement but it is not
}

extend(MDataType, MType);
function MDataType(){
	this.name = "DataType"	
	
	this.attributes = [] //this meta-attribute should be inherited from MType but it is not
	this.definitions = [] //this meta-attribute should be inherited from MNamedElement but it is not
	this.synonyms = [] //this meta-attribute should be inherited from MNamedElement but it is not
}

extend(MGeneralizationSet, MNamedElement);
function MGeneralizationSet() {
	this.complete = true
	this.disjoint = true
	this.name = ''
	this.generalizations = []
}

extend(MGeneralizationSet, MElement);
function MGeneralization(){
	this.general = null
	this.specific = null
	this.generalizationSet = null
}

extend(MRelationship, MNamedElement);
function MRelationship(){
	this.source = null
	this.target = null
	this.endPoints = [ new MEndPoint(), new MEndPoint() ]	
}

extend(MProperty, MNamedElement);
function MProperty(){	
	this.multiplicity = "1"
	this.dependency = false	
	this.ordered = false	
	this.owner = null
	this.derived = false
}

extend(MAttribute, MProperty);
function MAttribute() {
	this.stereotype = null
}

extend(MEndPoint, MProperty);
function MEndPoint() {
	this.classifier = null
	this.subsets = []
	this.redefines = []
}