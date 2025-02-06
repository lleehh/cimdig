import { ComponentIcon } from "@/components/component-icon";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BusbarSection } from "@/lib/cim";
import { componentRefs, componentParameters } from "@/lib/services/cim-service";
import AdditionalCimLinks from "../additional-cim-links-component";
import DisplayProperty from "./display-property-component";

interface BusbarProps {
    equipment: BusbarSection
}

export default function BusbarComponent({equipment}: BusbarProps) {

    const dropdownList = componentRefs(equipment).map((ref) => ref.rdfType)
    const propertiyList = componentParameters(equipment)

    return (
        <Card className="w-[230px] relative">
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="samleskinne"/>
                        Busbar
                    </div>
                    <AdditionalCimLinks nameList={dropdownList}/>
                    <DisplayProperty data={propertiyList}/>
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