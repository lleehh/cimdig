'use client'
import {Bay} from "@/lib/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { colorStyling } from "../dig/flow-component";
import {CollapsedStyling} from "../dig/flow-component";
import {LandPlot} from 'lucide-react';
import BtnGroupComponent from "../btn-group-component";


interface BayProps {
    equipment: Bay
    collapsed?: boolean
    handleExpand: () => void
}

export default function Baycomponent({equipment, collapsed, handleExpand}: BayProps) {

    if (collapsed)
        return (
            <>
                {colorStyling(equipment)}
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <LandPlot className="w-10 h-10"/>
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
                            <LandPlot/>
                            {equipment.rdfType}
                        </div>
                    </CardTitle>
                    <CardDescription>{equipment.name}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col space-y-4">
                    <div className="text-gray-400">{equipment.description}</div>
                </CardContent>
            </Card>
        </div>
    )
}