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
import DisplayProperty from "@/components/display-property-component";
import BtnGroupComponent from "../btn-group-component";

interface ConnectivetyNodeProps {
    equipment: CIM
    collapsed?: boolean
    handleExpand: () => void 
}


export default function GenericComponent({equipment, collapsed, handleExpand}: ConnectivetyNodeProps) {

    const refs = componentRefs(equipment)
    const propertiyList = componentParameters(equipment)

    
        if (collapsed)
            return (
                <>
                <div style={{backgroundColor: equipment.color?.toString()!, height: "10px"}}> </div>
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <Triangle className="w-10 h-10"/>
                    <div className="overflow-hidden text-m ml-2">{equipment.name as string}</div>
                </div>
                </>
            )

    return (
        <div>
            <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>
            <Card className="w-[250px]" color={equipment.color?.toString()!}>
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <Triangle/>
                        <div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                                title={equipment.rdfType as string}>{equipment.rdfType}
                        </div>
                    </div>
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
        </div>
    )
}



