'use client'
import {GeneratingUnit} from "@/lib/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import AdditionalCimLinks from "../additional-cim-links-component";
import {componentRefs} from "@/lib/services/cim-service";


interface GeneratorProps {
    equipment: GeneratingUnit
    collapsed?: boolean
}

export default function GeneratorComponent({equipment, collapsed}: GeneratorProps) {

    const dropdownList = componentRefs(equipment).map((ref) => ref.rdfType)

    if (collapsed)
        return (
            <div className="w-44 border border-gray-400 p-3">
            <ComponentIcon icon="generator"/>
        </div> 
        )

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="generator"/>
                        {equipment.rdfType}
                        <AdditionalCimLinks nameList={dropdownList}/>
                        
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
    )
}