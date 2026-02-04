'use client'
import {ComponentIcon} from "@/components/component-icon";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {BusbarSection} from "@/lib/cim";
import {CollapsedStyling, smallComponentStyling} from "../dig/flow-component";
import { colorStyling } from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";
import { OtherData } from "@/lib/store/store-flow";

interface BusbarProps {
    equipment: BusbarSection
    otherData: OtherData
    collapsed?: boolean
    handleExpand: () => void
}

export default function BusbarComponent({equipment, otherData, collapsed, handleExpand}: BusbarProps) {

    if (collapsed)
        return (
            <>
                {colorStyling(otherData.color ?? "black")}
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <ComponentIcon icon="samleskinne" className="w-10 h-10"/>
                    <div className="overflow-hidden text-m ml-2">{equipment.name}</div>
                </div>

            </>
        )


    return (
        <div>
            <BtnGroupComponent equipment={equipment} otherData={otherData} handleExpand={handleExpand}/>
            <Card className={`${smallComponentStyling()}`} color={otherData.color?.toString()!}>
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