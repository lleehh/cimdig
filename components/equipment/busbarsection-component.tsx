import {ComponentIcon} from "@/components/component-icon";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {BusbarSection} from "@/lib/cim";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";
import DisplayProperty from "./display-property-component";
import {CollapsedStyling} from "../dig/flow-component";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import { colorStyling } from "../dig/flow-component";

interface BusbarProps {
    equipment: BusbarSection
    collapsed?: boolean
}

export default function BusbarComponent({equipment, collapsed}: BusbarProps) {

    const refs = componentRefs(equipment)
    const propertiyList = componentParameters(equipment)

    
        if (collapsed)
            
            return (
                <>
                {colorStyling(equipment)}
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <ComponentIcon icon="samleskinne" className="w-10 h-10"/>
                    <div className="overflow-hidden text-m ml-2">{equipment.name}</div>
                </div>

                </>
            )


    


    return (
        <Card className="w-[230px] relative" color={equipment.color?.toString()!}>
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="samleskinne"/>
                        Busbar
                    </div>
                    <DisplayProperty data={propertiyList}/>
                    <AdditionalCimLinks componentRefs={refs} component={equipment}/>
                </CardTitle>
                <CardDescription>
                    <div className="w-32 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                         title={equipment.name}>
                        {equipment.name}
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    )
}