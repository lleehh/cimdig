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


interface PowerTransformerProps {
    equipment: PowerTransformer
}

export default function PowerTransformerComponent({equipment}: PowerTransformerProps) {
    const propertiyList = componentParameters(equipment)
    const refs = componentRefs(equipment)

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