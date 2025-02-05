'use client'
import {BaseVoltage, Breaker, NonConformLoad} from "@/lib/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Factory } from "lucide-react";
import {componentRefs} from "@/lib/services/cim-service";
import AdditionalCimLinks from "@/components/additional-cim-links-component";


interface NonConformLoadProps {
    equipment: NonConformLoad
}

export default function NonConformLoadComponent({equipment}: NonConformLoadProps) {

    const refs = componentRefs(equipment)


    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <Factory />
                        {equipment.rdfType}
                        <AdditionalCimLinks componentRefs={refs} component={equipment}/>
                    </div>
                </CardTitle>
                <CardDescription>{equipment.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
                <div className="text-gray-400">{equipment.description}</div>
                <div>
                    Voltage {(equipment.baseVoltage as BaseVoltage)?.name}
                </div>
            </CardContent>
        </Card>
    )
}