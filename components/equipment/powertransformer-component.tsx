'use client'
import { ComponentIcon } from "@/components/component-icon";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { PowerTransformer } from "@/lib/cim";
import { componentRefs } from "@/lib/services/cim-service";
import AdditionalCimLinks from "../additional-cim-links-component";


interface PowerTransformerProps {
    equipment: PowerTransformer
}

export default function PowerTransformerComponent({equipment}: PowerTransformerProps) {

    const dropdownList = componentRefs(equipment).map((ref) => ref.rdfType)

    return (
        <Card className="w-[230px]">
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="transformator"/>
                        PT
                    </div>
                    <AdditionalCimLinks nameList={dropdownList}/>
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