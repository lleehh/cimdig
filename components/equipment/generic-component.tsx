'use client'
import {CIM, ConnectivityNode, IdentifiedObject} from "@/lib/cim";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Triangle} from "lucide-react";
import {ComponentIcon} from "@/components/component-icon";
import AdditionalCimLinks from "@/components/additional-cim-links-component";


interface ConnectivetyNodeProps {
    equipment: CIM
}

const dropdownList = [
    "Find Out More",
]

export default function GenericComponent({equipment}: ConnectivetyNodeProps) {

    return (
        <Card className="w-[250px]">
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <Triangle/>
                        {equipment.name &&
                            <div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                                 title={equipment.name as string}>
                                {equipment.name}
                            </div>}
                    </div>
                    <AdditionalCimLinks nameList={dropdownList}/>
                </CardTitle>
                <CardDescription>{equipment.rdfType}</CardDescription>
            </CardHeader>
        </Card>
    )
}