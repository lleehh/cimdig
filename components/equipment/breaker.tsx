'use client'
import {BaseVoltage, Breaker} from "@/models/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";


interface BreakerProps {
    equipment: Breaker
}


export default function BreakerComponent({equipment}: BreakerProps) {

console.log("BreakerComponent", equipment)

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="bryter"/>
                        {equipment.rdfType}
                    </div>
                </CardTitle>
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
                    Voltage {(equipment.baseVoltage as BaseVoltage).name}
                </div>
            </CardContent>
        </Card>
    )
}