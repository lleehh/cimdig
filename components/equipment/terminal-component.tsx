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
import {componentRefs} from "@/lib/services/cim-service";


interface TerminalProps {
    equipment: Terminal
    collapsed?: boolean
}


export default function TerminalComponent({equipment, collapsed}: TerminalProps) {

    if (collapsed)
        return (
            <div className="w-44 border border-gray-400 p-3">
            <FileTerminal/>
        </div> 
        )

    return (
        <Card className="w-[160px]">
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <FileTerminal/> T{equipment.sequenceNumber}
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