'use client'
import {IdentifiedObject} from "@/lib/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { OtherData } from "@/lib/store/store-flow";

interface EquipmentProps {
    equipment: IdentifiedObject
    otherData: OtherData
}

export default function EquipmentComponent({equipment}: EquipmentProps) {

    return (
        <Card className="w-[350px]" color={equipment.color?.toString()!}>
            <CardHeader>
                <CardTitle>{equipment.rdfType}</CardTitle>
                <CardDescription>{equipment.name}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-gray-400">{equipment.description}</div>
            </CardContent>
            <CardFooter className="text-red-300 rounded-md">
                Generic Component
            </CardFooter>
        </Card>
    )
}