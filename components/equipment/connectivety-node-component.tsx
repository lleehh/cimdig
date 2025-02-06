'use client'
import {ConnectivityNode} from "@/lib/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import {FileTerminal, Shell} from "lucide-react";
import AdditionalCimLinks from "../additional-cim-links-component";
import {componentRefs, componentParameters} from "@/lib/services/cim-service";
import DisplayProperty from "./display-property-component";



interface ConnectivetyNodeProps {
    equipment: ConnectivityNode
}

export default function ConnectivityNodeComponent({equipment}: ConnectivetyNodeProps) {

    const dropdownList = componentRefs(equipment).map((ref) => ref.rdfType)
    const propertiyList = componentParameters(equipment)

    return (
        <Card className="w-[160px]">
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <Shell/> CN
                    </div>
                    <AdditionalCimLinks nameList={dropdownList}/>
                    <DisplayProperty data={propertiyList}/>
                </CardTitle>
                <CardDescription>
                    <div className="w-32 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                         title={equipment.name}>
                        {equipment.name}
                    </div>
                </CardDescription>
            </CardHeader>
        </Card>
    )
}