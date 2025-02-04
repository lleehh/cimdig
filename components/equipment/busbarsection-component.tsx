import {BusbarSection} from "@/lib/cim";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {ComponentIcon} from "@/components/component-icon";
import AdditionalCimLinks from "../additional-cim-links-component";
import { Shell } from "lucide-react";

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
        <Card className="w-[230px] ">
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="samleskinne"/>
                        Buss Bar
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