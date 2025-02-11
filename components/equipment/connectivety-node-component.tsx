'use client'
import {ConnectivityNode} from "@/lib/cim";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Shell} from "lucide-react";
import {CollapsedStyling} from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";


interface ConnectivetyNodeProps {
    equipment: ConnectivityNode
    collapsed?: boolean
    handleExpand: () => void
}

export default function ConnectivityNodeComponent({equipment, collapsed, handleExpand}: ConnectivetyNodeProps) {

    if (collapsed)
        return (
            <>
                <div style={{backgroundColor: equipment.color?.toString()!, height: "10px"}}></div>
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <Shell className="w-8 h-8"/>
                    <div className="overflow-hidden text-m ml-2">{equipment.name}</div>
                </div>
            </>
        )

    return (
        <div>
            <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>
            <Card className="w-[160px]" color={equipment.color?.toString()!}>
                <CardHeader className="p-2">
                    <CardTitle className="flex justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <Shell/> CN
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