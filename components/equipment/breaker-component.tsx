'use client'
import {BaseVoltage, Breaker} from "@/lib/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";
import DisplayProperty from "../display-property-component";
import {CollapsedStyling} from "../dig/flow-component";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import {Expand} from "lucide-react";
import {Button} from "@/components/ui/button";
import BtnGroupComponent from "../btn-group-component";

interface BreakerProps {
    equipment: Breaker
    collapsed?: boolean
    handleExpand: () => void 
}

export default function BreakerComponent({equipment, collapsed, handleExpand}: BreakerProps) {

    const refs = componentRefs(equipment)
    const propertiyList = componentParameters(equipment)

    if (collapsed)
        return (
            <div className={CollapsedStyling()}>
                <ComponentIcon icon="bryter"/>
            </div>
        )

    return (
        <div>
            <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>

            <Card className="w-[350px]" color={equipment.color?.toString()!}>
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