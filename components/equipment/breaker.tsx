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


interface BreakerProps {
    equipment: Breaker
}


export default function BreakerComponent({equipment}: BreakerProps) {

console.log("BreakerComponent", equipment)

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
                    Voltage {(equipment.baseVoltage as BaseVoltage).nominalVoltage}
                </div>
            </CardContent>
        </Card>
    )
}