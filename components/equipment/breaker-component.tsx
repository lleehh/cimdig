'use client'
import {BaseVoltage, Breaker} from "@/lib/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import AdditionalCimLinks from "../additional-cim-links-component";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";


interface BreakerProps {
    equipment: Breaker
}

export default function BreakerComponent({equipment}: BreakerProps) {

    const dropdownList = componentRefs(equipment).map((ref) => ref.rdfType)
    const propertiyList = componentParameters(equipment)
    console.log(propertiyList)
    

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
                    <AdditionalCimLinks nameList={dropdownList}/>
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
                <DisplayProperty data={propertiyList}/>

            </CardContent>
        </Card>
    )
}

function DisplayProperty({ data }: { data: Record<string, String>}) {
    return (
  <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
    <h2 className="text-l font-semibold text-gray-800">Properties</h2>
    <ul className="space-y-2">
        {Object.entries(data)
        .filter(([key]) => key !== 'rdfId')
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => (
            <li key={key} className="flex">
                <span className="text-gray-600 font-medium w-20 pr-2 text-xs">{key}:</span>
                <span className="text-gray-800 flex-1 text-xs">{value}</span>
            </li>
        ))}
    </ul>
  </div>
    );
  } 