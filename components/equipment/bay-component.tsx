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
import DisplayProperty from "../display-property-component";
import { CollapsedStyling } from "../dig/flow-component";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import { LandPlot } from 'lucide-react';
import BtnGroupComponent from "../btn-group-component";


interface BayProps {
    equipment: Bay
    collapsed?: boolean
    handleExpand: () => void 
}

export default function Baycomponent({equipment, collapsed, handleExpand}: BayProps) {
    const propertiyList = componentParameters(equipment)
    const refs = componentRefs(equipment)
    

    if (collapsed)
        return (
            <div className={CollapsedStyling()}>
            <LandPlot/>
        </div> 
        )

        return (
            <div>
                <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>
                <Card className="w-[350px]">
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