import { ComponentIcon } from "@/components/component-icon";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BusbarSection } from "@/lib/cim";
import { componentRefs } from "@/lib/services/cim-service";
import AdditionalCimLinks from "../additional-cim-links-component";
import { CollapsedStyling } from "../dig/flow-component";

interface BusbarProps {
    equipment: BusbarSection
    collapsed?: boolean
}

export default function BusbarComponent({equipment, collapsed}: BusbarProps) {

    const dropdownList = componentRefs(equipment).map((ref) => ref.rdfType)

    if (collapsed)
        return (
            <div className={CollapsedStyling()}>
            <ComponentIcon icon="samleskinne"/>
        </div> 
        )


    return (
        <Card className="w-[230px] ">
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="samleskinne"/>
                        Busbar
                    </div>
                    <AdditionalCimLinks nameList={dropdownList}/>
                </CardTitle>
                <CardDescription>
                    <div className="w-32 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                         title= {equipment.name}>
                        {equipment.name}
                    </div>

                </CardDescription>
            </CardHeader>
        </Card>
    )
}