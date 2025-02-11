'use client'
import { ComponentIcon } from "@/components/component-icon";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { PowerTransformer } from "@/lib/cim";
import {componentParameters, componentRefs} from "@/lib/services/cim-service";
import AdditionalCimLinks from "../additional-cim-links-component";
import DisplayProperty from "@/components/equipment/display-property-component";
import {CollapsedStyling} from "@/components/dig/flow-component";
import { colorStyling } from "../dig/flow-component";


interface PowerTransformerProps {
    equipment: PowerTransformer
    collapsed?: boolean
}

export default function PowerTransformerComponent({equipment, collapsed}: PowerTransformerProps) {
    const propertiyList = componentParameters(equipment)
    const refs = componentRefs(equipment)

    if (collapsed)
        return (
            <>
            {colorStyling(equipment)}
            <div className={`${CollapsedStyling()} flex items-center`}>
                <ComponentIcon icon="transformator" className="w-16 h-16"/>
                <div className="overflow-hidden text-m ml-2">{equipment.name as string}</div>
            </div>
            </>
        )

    return (
        <Card className="w-[230px]">
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="transformator"/>
                        PT
                    </div>
                    <DisplayProperty data={propertiyList}/>
                    <AdditionalCimLinks componentRefs={refs} component={equipment}/>
                </CardTitle>
                <CardDescription>
                    <div className="w-32 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                         title={equipment.name as string}>
                        {equipment.name as string}
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    )
}