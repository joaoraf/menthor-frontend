
/** ===========================
  * OntoUML - Abstract Syntax
  * 
  * There is no good solution in javascript to subclassing arrays. 
  * That's why we replicated the arrays in some leafs of the hierarchy.
  * =========================== */

extend(OntoUMLClass, MClass);
function OntoUMLClass(){
	this.stereotype = null
	
	this.attributes = [] //this meta-attribute should be inherited from MType but it is not
	this.definitions = [] //this meta-attribute should be inherited from MNamedElement but it is not
	this.synonyms = [] //this meta-attribute should be inherited from MNamedElement but it is not
}

extend(OntoUMLDataType, MDataType);
function OntoUMLDataType(){
	this.stereotype = null
	
	this.attributes = [] //this meta-attribute should be inherited from MType but it is not
	this.definitions = [] //this meta-attribute should be inherited from MNamedElement but it is not
	this.synonyms = [] //this meta-attribute should be inherited from MNamedElement but it is not
}

extend(OntoUMLRelationship, MRelationship);
function OntoUMLRelationship(){
	this.stereotype = null
	this.essentialPart = false,
	this.immutablePart = false,
	this.immutableWhole = false,
	this.inseparablePart = false,
	this.shareable = false,
	
	this.endPoints = [ new MEndPoint(), new MEndPoint() ] //this meta-attribute should be inherited from MRelationship but it is not
}

extend(OntoUMLAttribute, MAttribute);
function OntoUMLAttribute(){}

extend(OntoUMLEndPoint, MEndPoint);
function OntoUMLEndPoint() {
	
	this.subsets = [] //this meta-attribute should be inherited from MEndPoint but it is not
	this.redefines = [] //this meta-attribute should be inherited from MEndPoint but it is not
}

extend(OntoUMLGeneralizationSet, MGeneralizationSet);
function OntoUMLGeneralizationSet(){
	
	this.generalizations = [] //this meta-attribute should be inherited from MGeneralizationSet but it is not
}

extend(OntoUMLGeneralization, MGeneralization);
function OntoUMLGeneralization(){}

