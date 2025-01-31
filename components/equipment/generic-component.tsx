'use client'
import {CIM, ConnectivityNode, IdentifiedObject} from "@/models/cim";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Triangle} from "lucide-react";


interface ConnectivetyNodeProps {
    equipment: CIM
}

export default function GenericComponent({equipment}: ConnectivetyNodeProps) {

    return (
        <Card className="w-[150px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <Triangle/> {equipment.rdfType}
                    </div>
                </CardTitle>
                <CardDescription>{(equipment as IdentifiedObject).name}</CardDescription>
            </CardHeader>
        </Card>
    )
}