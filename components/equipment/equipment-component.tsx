'use client'
import {IdentifiedObject} from "@/models/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface EquipmentProps {
    equipment: IdentifiedObject
}

export default function EquipmentComponent({equipment}: EquipmentProps) {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>{equipment.rdfType}</CardTitle>
                <CardDescription>{equipment.name}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-gray-400">{equipment.description}</div>
            </CardContent>
            <CardFooter className="text-red-200">
                Generic Component
            </CardFooter>
        </Card>
    )
}