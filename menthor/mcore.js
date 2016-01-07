
/** ===========================
  * MCore 1.0 - Abstract Syntax
  * 
  * There is no good solution in javascript to subclassing arrays. 
  * That's why we replicated some arrays in the leafs of the hierarchy.
  * =========================== */

/** Stereotypes */

var PrimitiveStereotype = {
  INTEGER : {value: 0, name: "Integer", stereotype: "integer"}, 
  REAL    : {value: 1, name: "Real", stereotype: "real"}, 
  STRING  : {value: 2, name: "String", stereotype: "string"},
  BOOLEAN : {value: 3, name: "Boolean", stereotype: "boolean"},
  DATE    : {value: 4, name: "Date", stereotype: "date"},
  DATETIME: {value: 5, name: "DateTime", stereotype: "datetime"},
};

/** Extension */

extend(MNamedElement, MElement);
extend(MClassifier, MNamedElement);
extend(MType, MClassifier);
extend(MClass, MType);
extend(MDataType, MType);
extend(MRelationship, MClassifier);
extend(MGeneralizationSet, MNamedElement);
extend(MGeneralization, MNamedElement);
extend(MAttribute, MProperty);
extend(MProperty, MNamedElement);
extend(MLiteral, MNamedElement);
extend(MEndPoint, MProperty);

function MElement(){ this.id = null }
function MClassifier(){}
function MAttribute() { this.stereotype = null }
function MLiteral(){ this.value = '' }
function MClass(){ this.name = "Class" }	
function MNamedElement(){
	this.name = ''
	this.uniqueName = null
	this.text = null
	this.definitions = []
	this.synonyms = [] 
}
function MType() {
	this.attributes = []
	this.isAbtract = false	
}
function MDataType(){
	this.name = "DataType"	
	this.stereotype = "dataType"
	this.literals = []	
}
function MRelationship(){
	this.source = null
	this.target = null
	this.endPoints = [ new MEndPoint(), new MEndPoint() ]	
}
function MGeneralizationSet() {
	this.complete = true
	this.disjoint = true	
	this.generalizations = []
}
function MGeneralization(){
	this.general = null
	this.specific = null
	this.generalizationSet = null
}
function MProperty(){	
	this.multiplicity = "1"
	this.dependency = false	
	this.ordered = false	
	this.owner = null
	this.derived = false
}
function MEndPoint() {
	this.classifier = null
	this.subsets = []
	this.redefines = []
}