'use client'
import {BaseVoltage, Bay} from "@/lib/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import {componentRefs} from "@/lib/services/cim-service";
import { CollapsedStyling } from "../dig/flow-component";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import { LandPlot } from 'lucide-react';


interface BayProps {
    equipment: Bay
    collapsed?: boolean
}

export default function Baycomponent({equipment, collapsed}: BayProps) {

    const refs = componentRefs(equipment)
    

    if (collapsed)
        return (
            <div className={CollapsedStyling()}>
            <LandPlot/>
        </div> 
        )

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="bryter"/>
                        <div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                             title={equipment.name || ""}>
                            {equipment.name}
                        </div>
                    </div>
                    <AdditionalCimLinks componentRefs={refs} component={equipment}/>
                </CardTitle>
                <CardDescription className="flex flex-col space-y-4">
                    <div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                         title={equipment.description || ""}>
                        Description: {equipment.description}
                    </div>
                    <div>
                        Voltage {(equipment.baseVoltage as BaseVoltage).name}
                    </div>
                </CardDescription>            </CardHeader>
            <CardContent className="flex flex-col space-y-4">

            </CardContent>
        </Card>
    )
}