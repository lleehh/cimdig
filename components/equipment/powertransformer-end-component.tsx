'use client'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PowerTransformerEnd } from "@/lib/cim";
import { FileTerminal } from "lucide-react";
import { ComponentIcon } from "../component-icon";


interface PTEProps {
    equipment: PowerTransformerEnd
}


export default function PowerTransformerEndComponent({equipment}: PTEProps) {

    return (
        <Card className="w-max">
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="transformator"/>
                        PTE
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