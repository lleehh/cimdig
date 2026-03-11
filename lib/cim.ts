export type RdfValue =
    | string
    | number
    | boolean
    | IdentifiedObject
    | IdentifiedObject[]
    | undefined;

export interface CIM {
    rdfId: string;
    rdfType: string;

    [key: string]: RdfValue;
}

export interface IdentifiedObject extends CIM {
    mRID: string;
    name: string;
    description?: string;
}

export interface Equipment extends IdentifiedObject {
    aggregate: boolean;
    equipmentContainer: EquipmentContainer;
    normallyInService: boolean;
}

export interface ConductingEquipment extends Equipment {
    baseVoltage: BaseVoltage;
    terminals: Terminal[];
}

export function isConductingEquipment(equipment: CIM): equipment is ConductingEquipment {
    return (
        (equipment as ConductingEquipment).baseVoltage !== undefined ||
        (equipment as ConductingEquipment).terminals !== undefined
    );
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

export interface EquipmentContainer extends IdentifiedObject {}

export interface VoltageLevel extends EquipmentContainer {
    rdfType: "cim:VoltageLevel";
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

export function isTerminal(equipment: CIM): equipment is Terminal {
    return (equipment as Terminal).rdfType === "cim:Terminal";
}

export interface NonConformLoad extends ConductingEquipment {
    pfixed: number;
    qfixed: number;
}

export interface BusbarSection extends ConductingEquipment {
    rdfType: "cim:BusbarSection";
}

export interface PowerTransformer extends ConductingEquipment {
    rdfType: "cim:PowerTransformer";
    connectivityNodeContainer: EquipmentContainer;
}

export interface PowerTransformerEnd extends ConductingEquipment {
    rdfType: "cim:PowerTransformerEnd";
    transformer: PowerTransformer;
    terminal: Terminal;
}

export interface Bay extends EquipmentContainer {
    rdfType: "cim:Bay";
}

export interface Substation extends EquipmentContainer {
    rdfType: "cim:Substation";
}

export interface Line extends EquipmentContainer {}

export interface ConformLoad extends ConductingEquipment {}

/*Reference: https://ontology.tno.nl/IEC_CIM/cim_SynchronousMachine.html */
export interface SynchronousMachine extends ConductingEquipment {
    rdfType: "cim:SynchronousMachine";
    maxQ: number;
    minQ: number;
    maxU: number;
    minU: number;
    qPercent: number;
    r: number;
    type: string;
    ratedS: number;
    generatingUnit: GeneratingUnit;
    regulatingControl: IdentifiedObject;
}

export interface Disconnector extends ConductingEquipment {
    rdfType: "cim:Disconnector";
    normalOpen: boolean;
    retained: boolean;
}

/*Reference: https://ontology.tno.nl/IEC_CIM/cim_LinearShuntCompensator.html */
export interface LinearShuntCompensator extends ConductingEquipment {
    rdfType: "cim:LinearShuntCompensator";
    bPerSection: number;
    gPerSection: number;
    maximumSections: number;
    nomU: number;
    normalSections: number;
}

/*Reference: https://ontology.tno.nl/IEC_CIM/cim_RatioTapChanger.html */
export interface RatioTapChanger extends IdentifiedObject {
    rdfType: "cim:RatioTapChanger";
    stepVoltageIncrement: number;
    tculControlMode: string;
    highStep: number;
    lowStep: number;
    neutralStep: number;
    neutralU: number;
    normalStep: number;
    ltcFlag: boolean;
    transformerEnd: PowerTransformerEnd;
    tapChangerControl: IdentifiedObject;
}

/*Reference: https://ontology.tno.nl/IEC_CIM/cim_RegulatingControl.html */
export interface RegulatingControl extends IdentifiedObject {
    rdfType: "cim:RegulatingControl";
    mode: string;
    terminal: Terminal;
}

export interface CurrentLimit extends IdentifiedObject {
    rdfType: "cim:CurrentLimit";
    value: number;
    normalValue: number;
    operationalLimitSet: IdentifiedObject;
    operationalLimitType: IdentifiedObject;
}

export interface VoltageLimit extends IdentifiedObject {
    rdfType: "cim:VoltageLimit";
    value: number;
    normalValue: number;
    operationalLimitSet: IdentifiedObject;
    operationalLimitType: IdentifiedObject;
}

export interface OperationalLimitSet extends IdentifiedObject {
    rdfType: "cim:OperationalLimitSet";
    terminal: Terminal;
}

export interface GeographicalRegion extends IdentifiedObject {
    rdfType: "cim:GeographicalRegion";
    regions: IdentifiedObject[];
}

export interface SubGeographicalRegion extends IdentifiedObject {
    rdfType: "cim:SubGeographicalRegion";
    region: GeographicalRegion;
    lines: IdentifiedObject[];
    substations: IdentifiedObject[];
}

export interface ConformLoadGroup extends IdentifiedObject {
    rdfType: "cim:ConformLoadGroup";
    subLoadArea: IdentifiedObject;
    energyConsumers: IdentifiedObject[];
}

export interface ControlArea extends IdentifiedObject {
    rdfType: "cim:ControlArea";
    type: string;
    energyArea: IdentifiedObject;
}

export interface LoadArea extends IdentifiedObject {
    rdfType: "cim:LoadArea";
    subLoadAreas: IdentifiedObject[];
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
