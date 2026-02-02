'use client'
import { ComponentIcon } from "@/components/component-icon";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { PowerTransformer } from "@/lib/cim";
import {CollapsedStyling} from "@/components/dig/flow-component";
import BtnGroupComponent from "../btn-group-component";
import { colorStyling } from "../dig/flow-component";
import { OtherData } from "@/lib/store/store-flow";


interface PowerTransformerProps {
    equipment: PowerTransformer
    otherData: OtherData
    collapsed?: boolean
    handleExpand: () => void 
}

export default function PowerTransformerComponent({equipment, otherData, collapsed, handleExpand}: PowerTransformerProps) {

    if (collapsed)
        return (
            <>
            {colorStyling(otherData.color)}
            <div className={`${CollapsedStyling()} flex items-center`}>
                <ComponentIcon icon="transformator" className="w-16 h-16"/>
                <div className="overflow-hidden text-m ml-2">{equipment.name as string}</div>
            </div>
            </>
        )

    return (
        <div>
            <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>
        <Card className="w-[230px]" color={otherData.color ?? "black"}>
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="transformator"/>
                        PT
                    </div>
                </CardTitle>
                <CardDescription>
                    <div className="w-32 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                         title={equipment.name as string}>
                        {equipment.name as string}
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
        </div>
    )
}