'use client'
import {ConnectivityNode} from "@/models/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import {Shell} from "lucide-react";
import AdditionalCimLinks from "../additional-cim-links-component";


interface ConnectivetyNodeProps {
    equipment: ConnectivityNode
}

const dropdownList = [
    "ConductivityNodeContainer",
]

export default function ConnectivityNodeComponent({equipment}: ConnectivetyNodeProps) {

    return (
        <Card className="w-[150px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <Shell/> CN
                        <AdditionalCimLinks nameList={dropdownList}/>
                    </div>
                </CardTitle>
                <CardDescription>
                    {equipment.name}
                </CardDescription>
            </CardHeader>
        </Card>
    )
}