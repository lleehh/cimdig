'use client'
import {CIM} from "@/lib/cim";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Triangle} from "lucide-react";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import {componentParameters, componentRefs} from "@/lib/services/cim-service";
import { CollapsedStyling } from "../dig/flow-component";
import DisplayProperty from "@/components/equipment/display-property-component";

interface ConnectivetyNodeProps {
    equipment: CIM
    collapsed?: boolean
}


export default function GenericComponent({equipment, collapsed}: ConnectivetyNodeProps) {

    const refs = componentRefs(equipment)
    const propertiyList = componentParameters(equipment)

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
                        <div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                             title={equipment.rdfType as string}>{equipment.rdfType}
                        </div>
                    </div>
                    <DisplayProperty data={propertiyList}/>
                    <AdditionalCimLinks componentRefs={refs} component={equipment}/>
                </CardTitle>
                <CardDescription>
                    <>
                        {equipment.name &&
                            <div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                                 title={equipment.name as string}>{equipment.name as string}
                            </div>}
                    </>
                </CardDescription>
            </CardHeader>
        </Card>
    )
}



