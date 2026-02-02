'use client'
import {ACLineSegment, BaseVoltage} from "@/lib/cim";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ComponentIcon} from "@/components/component-icon";
import {CollapsedStyling} from "../dig/flow-component";
import { colorStyling } from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";
import { OtherData } from "@/lib/store/store-flow";

interface EquipmentProps {
    equipment: ACLineSegment
    otherData: OtherData
    collapsed?: boolean
    handleExpand: () => void
}

export default function ACLineSegmentComponent({equipment, otherData, collapsed, handleExpand}: EquipmentProps) {

    if (collapsed)
        return (
            <>
                {colorStyling(otherData.color)}
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <ComponentIcon icon="ledningssegment" className="w-16 h-16"/>
                    <div className="overflow-hidden text-m ml-2">{equipment.name}</div>
                </div>
            </>
        )

    return (
        <div>
            <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>
            <Card className="w-[250px]" color={equipment.color?.toString()!}>
                <CardHeader className="p-2">
                    <CardTitle className="flex justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <ComponentIcon icon="ledningssegment"/>
                            <div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                                 title={equipment.name || ""}>
                                {equipment.name}
                            </div>
                        </div>
                    </CardTitle>
                    <CardDescription className="flex flex-col space-y-4">
                        <div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                             title={equipment.description || ""}>
                            Description: {equipment.description}
                        </div>
                        <div>
                            Voltage {(equipment?.baseVoltage as BaseVoltage).name}
                        </div>
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-2">

                </CardContent>
            </Card>
        </div>
    )
}
