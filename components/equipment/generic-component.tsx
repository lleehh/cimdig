'use client'
import {CIM, ConnectivityNode, IdentifiedObject, isConductingEquipment} from "@/lib/cim";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Triangle} from "lucide-react";
import {ComponentIcon} from "@/components/component-icon";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import {componentRefs} from "@/lib/services/cim-service";
import { CollapsedStyling } from "../dig/flow-component";


interface ConnectivetyNodeProps {
    equipment: CIM
    collapsed?: boolean
}

export default function GenericComponent({equipment, collapsed}: ConnectivetyNodeProps) {

    const dropdownList = componentRefs(equipment).map((ref) => ref.rdfType)

    if (collapsed)
        return (
            <div className={CollapsedStyling()}>
            <Triangle/>
        </div> 
        )

    return (
        <Card className="w-[250px]">
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <Triangle/>
                        {equipment.name &&
                            <div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                                 title={equipment.name as string}>
                            </div>}
                    </div>
                    <AdditionalCimLinks nameList={dropdownList}/>
                </CardTitle>
                <CardDescription>{equipment.rdfType}</CardDescription>
            </CardHeader>
        </Card>
    )
}