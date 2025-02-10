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
import {Factory} from "lucide-react";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";
import DisplayProperty from "../display-property-component";
import {CollapsedStyling} from "../dig/flow-component";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import BtnGroupComponent from "../btn-group-component";

interface NonConformLoadProps {
    equipment: NonConformLoad
    collapsed?: boolean
    handleExpand: () => void
}

export default function NonConformLoadComponent({equipment, collapsed, handleExpand}: NonConformLoadProps) {
    const propertiyList = componentParameters(equipment)
    const refs = componentRefs(equipment)

        if (collapsed)
            return (
                <>
                <div style={{backgroundColor: equipment.color?.toString()!, height: "10px"}}> </div>
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <Factory className="w-10 h-10"/>
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
                        <Factory/>
                        {equipment.rdfType}
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
        </div>
    )
}