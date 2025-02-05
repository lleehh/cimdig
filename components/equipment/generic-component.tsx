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


interface ConnectivetyNodeProps {
    equipment: CIM
}

export default function GenericComponent({equipment}: ConnectivetyNodeProps) {

    const refs = componentRefs(equipment)

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
                    <AdditionalCimLinks componentRefs={refs} component={equipment}/>
                </CardTitle>
                <CardDescription>{equipment.rdfType}</CardDescription>
            </CardHeader>
        </Card>
    )
}