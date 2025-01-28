'use client'
import {BaseVoltage, GeneratingUnit} from "@/models/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


interface GeneratorProps {
    equipment: GeneratingUnit
}


export default function GeneratorComponent({equipment}: GeneratorProps) {

console.log("GeneratorComponent", equipment)

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>{equipment.rdfType}</CardTitle>
                <CardDescription>{equipment.name}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-gray-400">{equipment.description}</div>
            </CardContent>
            <CardFooter className="text-green-300 rounded-md">
                Breaker Component
            </CardFooter>
            <CardContent>
                <div>
                    Max operating power limit {(equipment.maxOperatingP)}
                </div>
            </CardContent>
        </Card>
    )
}