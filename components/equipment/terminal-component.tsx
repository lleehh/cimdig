'use client'
import {GeneratingUnit, Terminal} from "@/lib/cim";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { SquareTerminal } from "lucide-react";

import AdditionalCimLinks from "../additional-cim-links-component";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";
import DisplayProperty from "./display-property-component";
import { CollapsedStyling } from "../dig/flow-component";



interface TerminalProps {
    equipment: Terminal
    collapsed?: boolean
}



export default function TerminalComponent({equipment, collapsed}: TerminalProps) {
    const propertiyList = componentParameters(equipment)

        if (collapsed)
            return (
                <>
                <div style={{backgroundColor: equipment.color?.toString()!, height: "10px"}}> </div>
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <SquareTerminal className="w-10 h-10"/>
                    <div className="overflow-hidden text-sm ml-2">{equipment.name}</div>
                </div>
                </>
            )

    const refs = componentRefs(equipment)

    return (

        <Card className="w-[160px]" color={equipment.color?.toString()!}>
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <SquareTerminal/> T{equipment.sequenceNumber}
                        <DisplayProperty data={propertiyList}/>
                    </div>
                </CardTitle>
                <CardDescription>
                    <div className="w-32 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                         title= {equipment.name}>
                        {equipment.name}
                    </div>

                </CardDescription>
            </CardHeader>
        </Card>
    )
}