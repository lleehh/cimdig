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
import {ComponentIcon} from "@/components/component-icon";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";
import DisplayProperty from "./display-property-component";
import { CollapsedStyling } from "../dig/flow-component";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import { LandPlot } from 'lucide-react';
import { colorStyling } from "../dig/flow-component";


interface BayProps {
    equipment: Bay
    collapsed?: boolean
}

export default function Baycomponent({equipment, collapsed}: BayProps) {
    const propertiyList = componentParameters(equipment)
    const refs = componentRefs(equipment)
    

    
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
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>
                        <div className="flex flex-row items-center gap-2">
                            <LandPlot/>
                            {equipment.rdfType}
                            <DisplayProperty data={propertiyList}/>
                            <AdditionalCimLinks componentRefs={refs} component={equipment}/>
                        </div>
                    </CardTitle>
                    <CardDescription>{equipment.name}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col space-y-4">
                    <div className="text-gray-400">{equipment.description}</div>
                </CardContent>
            </Card>
        )
    }