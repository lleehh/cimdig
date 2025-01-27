export interface RdfLink {
    id: string; // Represents a reference link (e.g., "#_2dd90169-bdfb-11e5-94fa-c8f73332c8f4")
}

export type RdfValue = string | number | boolean | RdfLink | undefined;

export interface CIM {
    rdfId: string
    rdfType: string

    [key: string]: RdfValue;
}

export interface IdentifiedObject extends CIM {
    name: string;
    description?: string;
}

export interface ACLineSegment extends IdentifiedObject {
    rdfType: "cim:ACLineSegment";
    bch: number;
    aggregate: boolean;
}

export interface Breaker extends IdentifiedObject {
    rdfType: "cim:Breaker";
    normalOpen: boolean;
    equipmentContainer: RdfLink;
}

export interface equipmentContainer {
    rdfType: "cim:Bay";
    IdentifiedName: string;
    voltageLevel: RdfLink;
    description: string;
}

/*

 "rdfType": "cim:ACLineSegment",
        "cim:ACLineSegment.bch": "0.0003333333",
        "cim:ACLineSegment.r": "22.5",
        "cim:ACLineSegment.x": "180",
        "cim:Conductor.length": "0",
        "cim:ConductingEquipment.BaseVoltage": "#_2dd90169-bdfb-11e5-94fa-c8f73332c8f4",
        "cim:Equipment.aggregate": "false",
        "cim:Equipment.normallyInService": "true",
        "cim:IdentifiedObject.description": "3701 6700 '1 '",
        "cim:IdentifiedObject.name": "300AJAURE-MO",
        "cim:Equipment.EquipmentContainer": "#_5e7d0b4c-fa65-1d40-aef6-779298018c7e"
    },
 */