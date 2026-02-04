'use client'
import {BaseVoltage, ConformLoad} from "@/lib/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {HousePlug} from "lucide-react";
import {CollapsedStyling} from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";
import { colorStyling } from "../dig/flow-component";
import { OtherData } from "@/lib/store/store-flow";

interface ConformLoadProps {
    equipment: ConformLoad
    otherData: OtherData
    collapsed?: boolean
    handleExpand: () => void
}

export default function ConformLoadComponent({equipment, otherData, collapsed, handleExpand}: ConformLoadProps) {

    if (collapsed)
        return (
            <>
                {colorStyling(otherData.color ?? "black")}
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <HousePlug className="w-10 h-10"/>
                    <div className="overflow-hidden text-m ml-2">{equipment.name}</div>
                </div>
            </>
        )


    return (
        <div>
            <BtnGroupComponent equipment={equipment} otherData={otherData} handleExpand={handleExpand}/>
            <Card color={otherData.color ?? "black"}>
                <CardHeader>
                    <CardTitle>
                        <div className="flex flex-row items-center gap-2">
                            <HousePlug/>
                            {equipment.rdfType}
                        </div>
                    </CardTitle>
                    <CardDescription>{equipment.name}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col">
                    <div className="text-gray-400">{equipment.description}</div>
                    <div>
                        Voltage {(equipment.baseVoltage as BaseVoltage)?.name}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}