'use client'
import {GeneratingUnit, Terminal} from "@/lib/cim";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import { FileTerminal } from "lucide-react";
import AdditionalCimLinks from "../additional-cim-links-component";
import {componentParameters} from "@/lib/services/cim-service";
import DisplayProperty from "./display-property-component";


interface TerminalProps {
    equipment: Terminal
}


export default function TerminalComponent({equipment}: TerminalProps) {
    const propertiyList = componentParameters(equipment)

    return (
        <Card className="w-[160px]">
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <FileTerminal/> T{equipment.sequenceNumber}
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