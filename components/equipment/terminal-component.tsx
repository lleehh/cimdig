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


interface TerminalProps {
    equipment: Terminal
}


export default function TerminalComponent({equipment}: TerminalProps) {

    return (
        <Card className="w-[150px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <FileTerminal/>
                        {equipment.name}
                    </div>
                    
                </CardTitle>
                <CardDescription>
                    <div className="text-gray-400">Sequence: {equipment.sequenceNumber}</div>
                </CardDescription>
            </CardHeader>
        </Card>
    )
}