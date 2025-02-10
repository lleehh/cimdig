'use client'
import {Line, BaseVoltage} from "@/lib/cim";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ComponentIcon} from "@/components/component-icon";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";
import {CollapsedStyling} from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";

interface LineProps {
    equipment: Line
    collapsed?: boolean
    handleExpand: () => void 
}

export default function LineComponent({equipment, collapsed, handleExpand}: LineProps) {

    const refs = componentRefs(equipment)
    const propertiyList = componentParameters(equipment)

    if (collapsed)
        return (
            <>
            <div style={{backgroundColor: equipment.color?.toString()!, height: "10px"}}> </div>
            <div className={`${CollapsedStyling()} flex items-center`}>
                    <ComponentIcon icon="overforing" className="w-16 h-16"/>
                    <div className="overflow-hidden text-m ml-2">{equipment.name}</div>
                
            </div>
            </>
        )


    return (
        <div>
            <BtnGroupComponent equipment={equipment} handleExpand={handleExpand}/>
            <Card className="w-[160px]" color={equipment.color?.toString()!}>
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
