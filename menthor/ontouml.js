
/** ===========================
  * OntoUML 2.0 - Abstract Syntax
  * 
  * There is no good solution in javascript to subclassing arrays. 
  * That's why we replicated some arrays in the leafs of the hierarchy.
  * =========================== */

/** Stereotypes */

var ClassStereotype = {
  KIND      : {value: 0, name: "Kind", stereotype: "kind"},   
  QUANTITY  : {value: 1, name: "Quantity", stereotype: "quantity"},
  COLLECTIVE: {value: 2, name: "Collective", stereotype: "collective"},
  MODE      : {value: 3, name: "Mode", stereotype: "mode"}, 
  RELATOR   : {value: 4, name: "Relator", stereotype: "relator"},
  QUALITY   : {value: 5, name: "Quality", stereotype: "quality"},
  SUBKIND   : {value: 6, name: "SubKind", stereotype: "subKind"}, 
  PHASE     : {value: 7, name: "Phase", stereotype: "phase"},
  ROLE      : {value: 8, name: "Role", stereotype: "role"},
  CATEGORY  : {value: 9, name: "Category", stereotype: "category"}, 
  ROLEMIXIN : {value: 10, name: "RoleMixin", stereotype: "roleMixin"}, 
  PHASEMIXIN: {value: 11, name: "PhaseMixin", stereotype: "phaseMixin"},
  MIXIN     : {value: 12, name: "Mixin", stereotype: "mixin"},  
  POWERTYPE : {value: 13, name: "PowerType", stereotype: "powerType"},  
  EVENT     : {value: 14, name: "Event", stereotype: "event"},  
};

var DataTypeStereotype = {
  DATATYPE   : {value: 0, name: "DataType", stereotype: "dataType"}, 
  DIMENSION  : {value: 1, name: "Dimension", stereotype: "dimension"}, 
  DOMAIN     : {value: 2, name: "Domain", stereotype: "domain"},
  ENUMERATION: {value: 3, name: "Enumeration", stereotype: "enumeration"},  
};

var RelationshipStereotype = {
  MEDIATION       : {value: 0, name: "Mediation", stereotype: "mediation"}, 
  CHARACTERIZATION: {value: 1, name: "Characerization", stereotype: "characterization"}, 
  STRUCTURATION   : {value: 2, name: "Structuration", stereotype: "structuration"},
  FORMAL          : {value: 3, name: "Formal", stereotype: "formal"},
  MATERIAL        : {value: 4, name: "Material", stereotype: "material"}, 
  COMPONENTOF     : {value: 5, name: "ComponentOf", stereotype: "componentOf"}, 
  MEMBEROF        : {value: 6, name: "MemberOf", stereotype: "memberOf"},
  SUBCOLLECTIONOF : {value: 7, name: "SubCollectionOf", stereotype: "subCollectionOf"},  
  SUBQUANTITYOF   : {value: 8, name: "SubQuantityOf", stereotype: "subQuantityOf"}, 
  QUAPARTOF       : {value: 9, name: "QuaPartOf", stereotype: "quaPartOf"}, 
  CONSTITUTION    : {value: 10,name: "Constitution", stereotype: "constitution"},
  CAUSATION       : {value: 11,name: "Causation", stereotype: "causation"},
  PARTICIPATION   : {value: 12,name: "Participation", stereotype: "participation"},
  SUBEVENTOF      : {value: 13,name: "SubEventOf", stereotype: "subEventOf"},
  TEMPORAL        : {value: 14,name: "Temporal", stereotype: "temporal"},
  PARTICIPATION   : {value: 15,name: "InstanceOf", stereotype: "instanceOf"},
  DERIVATION      : {value: 16,name: "Derivation", stereotype: "derivation"},
};
			
/** Extension */

extend(OntoUMLClass, MClass);
extend(OntoUMLDataType, MDataType);
extend(OntoUMLAttribute, MAttribute);
extend(OntoUMLEndPoint, MEndPoint);
extend(OntoUMLLiteral, MLiteral);
extend(OntoUMLGeneralizationSet, MGeneralizationSet);
extend(OntoUMLGeneralization, MGeneralization);
extend(OntoUMLRelationship, MRelationship);

function OntoUMLAttribute(){}
function OntoUMLEndPoint() {}
function OntoUMLLiteral(){}
function OntoUMLGeneralizationSet(){}
function OntoUMLGeneralization(){}
function OntoUMLClass(){ 
	this.stereotype = null 
}
function OntoUMLDataType(){ 
	this.stereotype = null 
}
function OntoUMLRelationship(){
	this.stereotype = null	
	this.essentialPart = false
	this.immutablePart = false
	this.immutableWhole = false
	this.inseparablePart = false
	this.shareable = false
}


