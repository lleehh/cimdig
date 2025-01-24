'use client'
import {IdentifiedObject} from "@/models/cim";


interface EquipmentProps {
    equipment: IdentifiedObject
}

export default function EquipmentComponent({equipment}: EquipmentProps) {

    return <div>{equipment.name}</div>

}