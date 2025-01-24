'use client';
import {ReactFlowProvider} from "@xyflow/react";

type FlowRootProps = object

export default function FlowRoot({children}: React.PropsWithChildren<FlowRootProps>) {
    return (
        <ReactFlowProvider>
            {children}
        </ReactFlowProvider>
    )

}