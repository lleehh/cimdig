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
}

export default function GeneratorComponent({equipment}: GeneratorProps) {

    const dropdownList = componentRefs(equipment).map((ref) => ref.rdfType)

    return (
        <Card className="w-[350px]" color={equipment.color?.toString()!}>
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