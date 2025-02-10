'use client'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {PowerTransformerEnd} from "@/lib/cim";
import {ComponentIcon} from "../component-icon";
import {Circle} from "lucide-react";
import {CollapsedStyling} from "@/components/dig/flow-component";
import BtnGroupComponent from "../btn-group-component";


interface PTEProps {
    equipment: PowerTransformerEnd
    collapsed?: boolean
    handleExpand: () => void 
}


export default function PowerTransformerEndComponent({equipment, collapsed, handleExpand}: PTEProps) {

    if (collapsed)
        return (
            <div className={CollapsedStyling()}>
                <Circle/> PTE
            </div>
        )

    return (
        <div>
            <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>
            <Card className="w-[160px]">
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <Circle/>
                        PTE
                    </div>
                </CardTitle>
                <CardDescription>
                    <div className="w-32 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                         title={equipment.name}>
                        {equipment.name}
                    </div>

                </CardDescription>
            </CardHeader>
        </Card>
        </div>
    )
}