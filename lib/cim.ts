export type RdfValue = string | number | boolean | IdentifiedObject | IdentifiedObject[] | undefined;

export interface CIM {
    rdfId: string
    rdfType: string

    [key: string]: RdfValue;
}

export interface IdentifiedObject extends CIM {
    mRID: string
    name: string
    description?: string
}

export interface Equipment extends IdentifiedObject {
    aggregate: boolean;
    equipmentContainer: EquipmentContainer;
    normallyInService: boolean;
}

export interface ConductingEquipment extends Equipment {
    baseVoltage: BaseVoltage
    terminals: Terminal[]
}

export function isConductingEquipment(equipment: CIM): equipment is ConductingEquipment {
    return (equipment as ConductingEquipment).baseVoltage !== undefined
        || (equipment as ConductingEquipment).terminals !== undefined;
}

export interface ACLineSegment extends ConductingEquipment {
    rdfType: "cim:ACLineSegment";
    bch: number;
}

export interface Breaker extends ConductingEquipment {
    rdfType: "cim:Breaker";
    normalOpen: boolean;
    equipmentContainer: EquipmentContainer;
}

export interface EquipmentContainer extends IdentifiedObject {

}

export interface VoltageLevel extends EquipmentContainer {
    rdfType: "cim:VoltageLevel";
}

export interface Bay extends EquipmentContainer {
    rdfType: "cim:Bay";
}

export interface BaseVoltage extends IdentifiedObject {
    rdfType: "cim:BaseVoltage";
    nominalVoltage: number;
}

/*Refrence: https://ontology.tno.nl/IEC_CIM/cim_GeneratingUnit.html */
export interface GeneratingUnit extends Equipment {
    rdfType: "cim:GeneratingUnit";
    maxOperatingP: number;
    minOperatingP: number;
}

export interface ConnectivityNode extends IdentifiedObject {
    connectivityNodeContainer: EquipmentContainer;
    terminals: Terminal[];
}

export function isConnectivityNode(equipment: CIM): equipment is ConnectivityNode {
    return (equipment as ConnectivityNode).connectivityNodeContainer !== undefined;
}


export interface Terminal extends IdentifiedObject {
    rdfType: "cim:Terminal";
    conductingEquipment: ConductingEquipment;
    connectivityNode: ConnectivityNode;
    sequenceNumber: number;
}

export interface NonConformLoad extends ConductingEquipment {
    pfixed: number;
    qfixed: number;
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