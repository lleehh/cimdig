import {BusbarSection} from "@/lib/cim";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {ComponentIcon} from "@/components/component-icon";
import AdditionalCimLinks from "../additional-cim-links-component";

interface BusbarProps {
    equipment: BusbarSection
}

const dropdownList = [
    "BaseVoltage",
    "EquipmentContainer",
    "ConductingEquipment",
    "OperatingShare",
]

export default function BusbarComponent({equipment}: BusbarProps) {

    return (
        <Card className="w-[350px] ">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="overforing"/>
                        {equipment.name}

                        <AdditionalCimLinks nameList={dropdownList}/>

                    </div>
                </CardTitle>
                <CardDescription className="flex flex-col space-y-4">
                    <div className="text-gray-400">{equipment.rdfId}</div>
                </CardDescription>
            </CardHeader>
            <CardFooter className="text-green-400">
                {equipment.rdfType}
            </CardFooter>
        </Card>
    )
}