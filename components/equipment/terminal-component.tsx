'use client'
import {GeneratingUnit, Terminal} from "@/models/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import { FileTerminal } from "lucide-react";
import AdditionalCimLinks from "../additional-cim-links-component";


interface TerminalProps {
    equipment: Terminal
}

const dropdownList = [
    "ConductingEquipment",
    "ConnectivityNode",
]


export default function TerminalComponent({equipment}: TerminalProps) {

    return (
        <Card className="w-[150px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <FileTerminal/>
                        {equipment.name}
                        <AdditionalCimLinks nameList={dropdownList}/>
                    </div>
                    
                </CardTitle>
                <CardDescription>
                    <div className="text-gray-400">Sequence: {equipment.sequenceNumber}</div>
                </CardDescription>
            </CardHeader>
        </Card>
    )
}