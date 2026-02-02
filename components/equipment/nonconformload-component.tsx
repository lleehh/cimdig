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
import {CollapsedStyling} from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";
import { colorStyling } from "../dig/flow-component";
import { OtherData } from "@/lib/store/store-flow";

interface NonConformLoadProps {
    equipment: NonConformLoad
    otherData: OtherData
    collapsed?: boolean
    handleExpand: () => void
}

export default function NonConformLoadComponent({equipment, otherData, collapsed, handleExpand}: NonConformLoadProps) {

    if (collapsed)
        return (
            <>
                {colorStyling(otherData.color ?? "black")}
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <Factory className="w-10 h-10"/>
                    <div className="overflow-hidden text-m ml-2">{equipment.name}</div>
                </div>
            </>
        )


    return (
        <div>
            <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>
            <Card className="w-[350px]" color={otherData.color ?? "black"}>
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