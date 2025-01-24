import {ACLineSegment} from "@/models/cim";


interface EquipmentProps {
    equipment: ACLineSegment
}

export default function ACLineSegmentComponent({equipment}: EquipmentProps) {

    return <div>{equipment.name}</div>

}