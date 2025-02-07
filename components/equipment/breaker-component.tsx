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
import DisplayProperty from "./display-property-component";
import {CollapsedStyling} from "../dig/flow-component";
import AdditionalCimLinks from "@/components/additional-cim-links-component";

interface BreakerProps {
    equipment: Breaker
    collapsed?: boolean
}

export default function BreakerComponent({equipment, collapsed}: BreakerProps) {

    const refs = componentRefs(equipment)
    const propertiyList = componentParameters(equipment)

    if (collapsed)
        return (
            <div className={CollapsedStyling()}>
                <ComponentIcon icon="bryter"/>
            </div>
        )

    return (
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
                    <DisplayProperty data={propertiyList}/>

                    <AdditionalCimLinks componentRefs={refs} component={equipment}/>
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
    )
}