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


interface ConnectivetyNodeProps {
    equipment: ConnectivityNode
}

export default function ConnectivityNodeComponent({equipment}: ConnectivetyNodeProps) {

    return (
        <Card className="w-[150px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <Shell/> CN
                    </div>
                </CardTitle>
                <CardDescription>{equipment.name}</CardDescription>
            </CardHeader>
        </Card>
    )
}