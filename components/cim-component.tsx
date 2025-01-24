'use client'
import {ACLineSegment, IdentifiedObject} from "@/models/cim";
import EquipmentComponent from "@/components/equipment-component";
import ACLineSegmentComponent from "@/components/aclinesegment-component";


interface EquipmentProps {
    equipment: IdentifiedObject
}

export default function CimComponent({equipment}: EquipmentProps) {

    const rdfType = equipment.rdfType

    if(rdfType === "cim:ACLineSegment") {
        return <ACLineSegmentComponent equipment={equipment as ACLineSegment}/>
    } else {
        return <EquipmentComponent equipment={equipment}/>
    }

}