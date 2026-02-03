'use client'
import {Line} from "@/lib/cim";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ComponentIcon} from "@/components/component-icon";
import {CollapsedStyling, mediumComponentStyling} from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";
import { OtherData } from "@/lib/store/store-flow";

interface LineProps {
    equipment: Line
    otherData: OtherData
    collapsed?: boolean
    handleExpand: () => void
}

export default function LineComponent({equipment, otherData, collapsed, handleExpand}: LineProps) {

    if (collapsed)
        return (
            <>
                <div style={{backgroundColor: otherData.color ?? "black", height: "10px"}}></div>
                <div className={`${CollapsedStyling()} flex items-center`}>
                    <ComponentIcon icon="overforing" className="w-16 h-16"/>
                    <div className="overflow-hidden text-m ml-2">{equipment.name}</div>

                </div>
            </>
        )


    return (
        <div>
            <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>
            <Card className={`${mediumComponentStyling()}`} color={otherData.color ?? "black"}>
                <CardHeader className="p-2">
                    <CardTitle className="flex justify-between">
                        <div className="flex flex-row items-center gap-2">
                            <ComponentIcon icon="overforing"/>
                            Line
                        </div>
                    </CardTitle>
                    <CardDescription className="flex flex-col space-y-4">
                        {equipment.name}
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
