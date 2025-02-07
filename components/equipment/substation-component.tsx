'use client'
import {BaseVoltage, Substation } from "@/lib/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import DisplayProperty from "./display-property-component";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";
import { CollapsedStyling } from "../dig/flow-component";
import AdditionalCimLinks from "@/components/additional-cim-links-component";

interface SubstationProps {
    equipment: Substation
    collapsed?: boolean
}

export default function Substationcomponent({equipment, collapsed}: SubstationProps) {
    const propertiyList = componentParameters(equipment)
    const refs = componentRefs(equipment)
    

    if (collapsed)
        return (
            <div className={CollapsedStyling()}>
            <ComponentIcon icon="stasjon"/>
        </div> 
        )

        return (
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>
                        <div className="flex flex-row items-center gap-2">
                            <ComponentIcon icon="stasjon"/>
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