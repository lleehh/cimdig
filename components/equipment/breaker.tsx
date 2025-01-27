'use client'
import {Breaker, equipmentContainer} from "@/models/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { findById } from "@/services/model-repository";
import { useEffect, useState } from "react";



interface BreakerProps {
    equipment: Breaker
}

const defaultEqu : equipmentContainer = {
        rdfType : "cim:Bay",
        IdentifiedName : "cim:Bay", 
        voltageLevel : {id : "0"},
        description : ""
    }



export default function BreakerComponent({equipment}: BreakerProps) {
    const[equ, setequ] = useState<equipmentContainer>(defaultEqu)

    useEffect(() => {
        const fetchData = async () => {
            const equContainer = await findById(equipment.equipmentContainer.id) 
            console.log(equContainer ? equContainer.rdfType : "NULL")
            return equContainer
        }

        fetchData()
    }, [])

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>{equipment.rdfType}</CardTitle>
                <CardDescription>{equipment.name}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-gray-400">{equipment.description}</div>
            </CardContent>
            <CardFooter className="text-red-300 rounded-md">
                Breaker Component
            </CardFooter>
            <CardContent>
                <div>
                    {equipment.normalOpen}
                </div>
            </CardContent>
        </Card>
    )
}