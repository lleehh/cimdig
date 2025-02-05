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
import {Shell} from "lucide-react";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import {componentRefs} from "@/lib/services/cim-service";


interface ConnectivetyNodeProps {
    equipment: ConnectivityNode
}

export default function ConnectivityNodeComponent({equipment}: ConnectivetyNodeProps) {

    const refs = componentRefs(equipment)

    return (
        <Card className="w-[160px]">
            <CardHeader className="p-2">
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <Shell/> CN
                    </div>
                    <AdditionalCimLinks componentRefs={refs} component={equipment}/>
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