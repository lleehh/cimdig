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
import {CollapsedStyling} from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";
import { colorStyling } from "../dig/flow-component";

interface GeneratorProps {
    equipment: GeneratingUnit
    collapsed?: boolean
    handleExpand: () => void
}

export default function GeneratorComponent({equipment, collapsed, handleExpand}: GeneratorProps) {

    if (collapsed)
        return (
            <>
                {colorStyling(equipment)}
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <ComponentIcon icon="generator" className="w-8 h-8"/>
                    <div className="overflow-hidden text-m ml-2">{equipment.name}</div>
                </div>
            </>
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