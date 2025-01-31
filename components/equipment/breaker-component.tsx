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
import AdditionalCimLinks from "../additional-cim-links-component";


interface BreakerProps {
    equipment: Breaker
}


export default function BreakerComponent({equipment}: BreakerProps) {

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="bryter"/>
                        {equipment.rdfType}
                        <AdditionalCimLinks/>
                        
                    </div>
                </CardTitle>
                <CardDescription>{equipment.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
                <div className="text-gray-400">{equipment.description}</div>
                <div>
                    Voltage {(equipment.baseVoltage as BaseVoltage).name}
                </div>
            </CardContent>
            <CardFooter className="text-green-300 rounded-md">
                Breaker
            </CardFooter>

        </Card>
    )
}