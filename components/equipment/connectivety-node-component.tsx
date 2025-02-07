'use client'
import {ConnectivityNode} from "@/lib/cim";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Shell} from "lucide-react";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";
import DisplayProperty from "./display-property-component";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import {CollapsedStyling} from "../dig/flow-component";


interface ConnectivetyNodeProps {
    equipment: ConnectivityNode
    collapsed?: boolean
}

export default function ConnectivityNodeComponent({equipment, collapsed}: ConnectivetyNodeProps) {

    const propertiyList = componentParameters(equipment)
    const refs = componentRefs(equipment)

    if (collapsed)
        return (
            <div className={CollapsedStyling()}>
                <Shell/>
            </div>
        )

    return (
        <Card className="w-[160px]" color={equipment.color?.toString()!}>
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <Shell/> CN
                    </div>
                    <DisplayProperty data={propertiyList}/>
                    <AdditionalCimLinks componentRefs={refs} component={equipment}/>
                </CardTitle>
                <CardDescription>
                    <div className="w-32 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                         title={equipment.name}>
                        {equipment.name}
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    )
}