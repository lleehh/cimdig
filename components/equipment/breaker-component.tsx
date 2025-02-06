'use client'
import {BaseVoltage, Breaker} from "@/lib/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import AdditionalCimLinks from "../additional-cim-links-component";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";
import DisplayProperty from "./display-property-component";

interface BreakerProps {
    equipment: Breaker
}

export default function BreakerComponent({equipment}: BreakerProps) {

    const dropdownList = componentRefs(equipment).map((ref) => ref.rdfType)
    const propertiyList = componentParameters(equipment)
    console.log(propertiyList)
    

    return (
        <Card className="w-[350px] relative">
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="bryter"/>
                        <div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                             title={equipment.name || ""}>
                            {equipment.name}
                        </div>
                    </div>
                    <AdditionalCimLinks nameList={dropdownList}/>
                    <DisplayProperty data={propertiyList}/>
                </CardTitle>
                <CardDescription className="flex flex-col space-y-4">
                    <div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                         title={equipment.description || ""}>
                        Description: {equipment.description}
                    </div>
                    <div>
                        Voltage {(equipment.baseVoltage as BaseVoltage).name}
                    </div>
                </CardDescription>            
            </CardHeader>
        </Card>
    )
}