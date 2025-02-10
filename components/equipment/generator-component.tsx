'use client'
import {GeneratingUnit} from "@/lib/cim";
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
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import {CollapsedStyling} from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";

interface GeneratorProps {
    equipment: GeneratingUnit
    collapsed?: boolean
    handleExpand: () => void
}

export default function GeneratorComponent({equipment, collapsed, handleExpand}: GeneratorProps) {

    const refs = componentRefs(equipment)
    const propertiyList = componentParameters(equipment)

    if (collapsed)
        return (
            <div className={CollapsedStyling()}>
                <ComponentIcon icon="generator"/>
            </div>
        )

    return (
        <div>
            <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>
            <Card className="w-[350px]" color={equipment.color?.toString()!}>
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="generator"/>
                        {equipment.rdfType}

                    </div>
                </CardTitle>
                <CardDescription>{equipment.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
                <div className="text-gray-400">{equipment.description}</div>
                <div>
                    Max operating power limit {(equipment.maxOperatingP)}
                </div>
            </CardContent>
        </Card>
        </div>
    )
}