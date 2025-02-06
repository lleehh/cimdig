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
import {ComponentIcon} from "@/components/component-icon";
import AdditionalCimLinks from "../additional-cim-links-component";
import { Factory } from "lucide-react";
import {componentRefs} from "@/lib/services/cim-service";


interface NonConformLoadProps {
    equipment: NonConformLoad
}

export default function NonConformLoadComponent({equipment}: NonConformLoadProps) {
    const dropdownList = componentRefs(equipment).map((ref) => ref.rdfType)


    return (
        <Card className="w-[350px]" color={equipment.color?.toString()!}>
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <Factory />
                        {equipment.rdfType}
                        <AdditionalCimLinks nameList={dropdownList}/>
                        
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