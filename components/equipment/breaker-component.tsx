'use client'
import {BaseVoltage, Breaker} from "@/lib/cim";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import {CollapsedStyling} from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";
import { colorStyling } from "../dig/flow-component";
import { OtherData } from "@/lib/store/store-flow";

interface BreakerProps {
    equipment: Breaker
    otherData: OtherData
    collapsed?: boolean
    handleExpand: () => void
}

export default function BreakerComponent({equipment, otherData, collapsed, handleExpand}: BreakerProps) {

    if (collapsed)
        return (
            <>
               {colorStyling(otherData.color ?? "black")}
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <ComponentIcon className="w-12 h-12" icon="bryter"/>
                    <div className="overflow-hidden text-m ml-2">{equipment.name}</div>
                </div>
            </>
        )

    return (
        <div>
            <BtnGroupComponent equipment={equipment} otherData={otherData} handleExpand={handleExpand}/>

            <Card color={otherData.color ?? "black"}>
                <CardHeader>
                    <CardTitle className="flex justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <ComponentIcon icon="bryter"/>
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
                            Voltage {(equipment.baseVoltage as BaseVoltage).name}
                        </div>
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>

    )
}