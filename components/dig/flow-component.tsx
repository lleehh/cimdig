import {NodeProps, Node, useStore, Handle, Position,} from "@xyflow/react";
import {ACLineSegment, Breaker, CIM, ConnectivityNode, IdentifiedObject} from "@/models/cim";
import ACLineSegmentComponent from "@/components/equipment/aclinesegment-component";
import BreakerComponent from "@/components/equipment/breaker-component";
import ConnectivityNodeComponent from "@/components/equipment/connectivety-node-component";
import GenericComponent from "@/components/equipment/generic-component";


export type FormContainerNode = Node<IdentifiedObject, 'flowComponent'>

const Placeholder = () => (
    <div className="w-72 border border-gray-400 p-3">
        <div role="form" className="w-full mb-1 bg-gray-200 dark:bg-gray-700 flex-grow h-4"/>
        <div role="form" className="w-full mb-1 bg-gray-200 dark:bg-gray-700 flex-grow h-4"/>
        <div role="form" className="w-full mb-1 bg-gray-200 dark:bg-gray-700 flex-grow h-4"/>
    </div>
);

const zoomSelector = (s: { transform: number[]; }) => s.transform[2] >= 0.6;


function CimComponent({equipment}: { equipment: CIM }) {

    const renderComponent = () => {
        switch (equipment.rdfType) {
            case "cim:ACLineSegment":
                return <ACLineSegmentComponent equipment={equipment as ACLineSegment}/>;
            case "cim:Terminal":
                return <BreakerComponent equipment={equipment as Breaker}/>;
            case "cim:ConnectivityNode":
                return <ConnectivityNodeComponent equipment={equipment as ConnectivityNode}/>;
            // Add more cases as needed
            default:
                return <GenericComponent equipment={equipment}/>;
        }
    };
    return (
        <>
            {renderComponent()}
        </>
    )
}


export default function FlowComponent({data}: NodeProps<FormContainerNode>) {
    const showContent = useStore(zoomSelector);

    return (
        <div>
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !rounded-none !bg-stone-400"/>
            {showContent ? <CimComponent equipment={data}/> : <Placeholder/>}
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !rounded-none !bg-stone-400" id=""/>
        </div>
    )
}