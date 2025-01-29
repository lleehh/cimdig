'use client'
import {BaseVoltage, Breaker} from "@/models/cim";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {ComponentIcon} from "@/components/component-icon";
import type { Node, NodeProps, XYPosition } from '@xyflow/react';
import {Handle, Position} from "@xyflow/react";
import { BreakerNode } from "@/components/dig/flow";


interface BreakerProps {
    equipment?: Breaker
    displayName: string
}

export interface BreakerFlowProps {
    id: string
    position: XYPosition
    data: Record<string, BreakerProps | null>


}
         
    export default function BreakerComponent({equipment, displayName}: BreakerProps) {

    
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="bryter"/>
                        {/* {equipment.rdfType} */}
                    </div>
                </CardTitle>
                {/* <CardDescription>{equipment.name}</CardDescription> */}
            </CardHeader>
            <CardContent>
                {/* <div className="text-gray-400">{equipment.description}</div> */}
            </CardContent>
            <CardFooter className="text-green-300 rounded-md">
                {displayName}
            </CardFooter>
            <CardContent>
                <div>
                    {/* Voltage {(equipment.baseVoltage as BaseVoltage).name} */}
                </div>
            </CardContent>
        </Card>

    )
}


export function FlowBreakerComponent({data}: NodeProps<BreakerNode>) {
    return (
        <div>
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !rounded-none !bg-stone-400"/>
            <BreakerComponent displayName="Breaker"/>
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !rounded-none !bg-stone-400" id=""/>
        </div>
    )
}