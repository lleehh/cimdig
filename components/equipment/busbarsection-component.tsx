import {ComponentIcon} from "@/components/component-icon";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {BusbarSection} from "@/lib/cim";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";
import DisplayProperty from "../display-property-component";
import {CollapsedStyling} from "../dig/flow-component";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import BtnGroupComponent from "../btn-group-component";

interface BusbarProps {
    equipment: BusbarSection
    collapsed?: boolean
    handleExpand: () => void
}

export default function BusbarComponent({equipment, collapsed, handleExpand}: BusbarProps) {

    const refs = componentRefs(equipment)
    const propertiyList = componentParameters(equipment)

    if (collapsed)
        return (
            <div className={CollapsedStyling()}>
                <ComponentIcon icon="samleskinne"/>
            </div>
        )


    return (
        <div>
        <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>
            <Card className="w-[230px]" color={equipment.color?.toString()!}>
                <CardHeader>
                    <CardTitle className="flex justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <ComponentIcon icon="samleskinne"/>
                            Busbar
                        </div>
                    </CardTitle>
                    <CardDescription>
                        <div className="w-32 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                            title={equipment.name}>
                            {equipment.name}
                        </div>
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}