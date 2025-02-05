'use client'
import {ACLineSegment, IdentifiedObject} from "@/lib/cim";
import EquipmentComponent from "@/components/equipment/equipment-component";
import ACLineSegmentComponent from "@/components/equipment/aclinesegment-component";
import { Minimize } from "lucide-react";

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