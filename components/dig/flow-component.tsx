import {NodeProps, useStore, Handle, Position, Edge,} from "@xyflow/react";
import {
    ACLineSegment,
    Breaker,
    CIM,
    ConnectivityNode,
    GeneratingUnit,
    isConnectivityNode,
    isTerminal,
    Terminal
} from "@/lib/cim";
import ACLineSegmentComponent from "@/components/equipment/aclinesegment-component";
import BreakerComponent from "@/components/equipment/breaker-component";
import ConnectivityNodeComponent from "@/components/equipment/connectivety-node-component";
import GenericComponent from "@/components/equipment/generic-component";
import useFlowStore, {CimNode, selector} from "@/lib/store/store-flow";
import TerminalComponent from "@/components/equipment/terminal-component";
import GeneratorComponent from "@/components/equipment/generator-component";
import {Button} from "@/components/ui/button";
import {Expand} from "lucide-react";
import {useShallow} from "zustand/react/shallow";
import {useState} from "react";
import {findById, getComponentById} from "@/lib/store/model-repository";
import {createEdge, createNode, doesEquipmentExistsInFlow} from "@/lib/flow-utils";


const Placeholder = () => (
    <div className="w-44 border border-gray-400 p-3">
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
                return <TerminalComponent equipment={equipment as Terminal}/>;
            case "cim:ConnectivityNode":
                return <ConnectivityNodeComponent equipment={equipment as ConnectivityNode}/>;
            case "cim:Breaker":
                return <BreakerComponent equipment={equipment as Breaker}/>;
            case "cim:GeneratingUnit":
                return <GeneratorComponent equipment={equipment as GeneratingUnit}/>;
            default:
                return <GenericComponent equipment={equipment}/>;
        }
    };
    return (<>
        {renderComponent()}
    </>)
}


export default function FlowComponent({data}: NodeProps<CimNode>) {
    const [component, setComponent] = useState<CIM | null>(null);

    const showContent = useStore(zoomSelector);

    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        setFocusNode
    } = useFlowStore(useShallow(selector),);


    const handleExpand = async () => {
        // We need to load the full component from the database to get all the properties
        let equipment = component
        if (!equipment) {
            equipment = await getComponentById(data.rdfId)
            setComponent(equipment)
        }
        const node = nodes.find(node => node.id === equipment?.rdfId)
        const edge = edges.filter(edge => edge.source === equipment?.rdfId || edge.target === equipment?.rdfId)

        /*
            We have a set of different types that we will automatically render:
            terminals, connectivity nodes
         */
        console.log("EQ", equipment?.rdfId, equipment?.rdfType)
        const newNodes: CimNode[] = []
        const newEdges: Edge[] = []
        if (node && equipment) {
            if (isTerminal(equipment)) {
                if (!doesEquipmentExistsInFlow(equipment.connectivityNode.rdfId, nodes)) {
                    newNodes.push(createNode(equipment.connectivityNode.rdfId, equipment.connectivityNode, 0, 0))
                    newEdges.push(createEdge(equipment.rdfId, equipment.connectivityNode.rdfId, equipment.sequenceNumber !== 1))

                }
                console.log("TERMINAL", equipment.rdfId, "ConductinEquipment", equipment.conductingEquipment.name, doesEquipmentExistsInFlow(equipment.conductingEquipment.rdfId, nodes))

                if (!doesEquipmentExistsInFlow(equipment.conductingEquipment.rdfId, nodes)) {
                    newNodes.push(createNode(equipment.conductingEquipment.rdfId, equipment.conductingEquipment, 0, 0))
                    newEdges.push(createEdge(equipment.rdfId, equipment.conductingEquipment.rdfId, equipment.sequenceNumber !== 1))
                }
            }
            if (isConnectivityNode(equipment)) {
                const rdfId = equipment.rdfId
                equipment.terminals.forEach(terminal => {
                    if (!doesEquipmentExistsInFlow(terminal.rdfId, nodes)) {
                        newNodes.push(createNode(terminal.rdfId, terminal, 0, 0))
                        newEdges.push(createEdge(terminal.rdfId, rdfId, false))
                    }
                })
            }
        }
        if (newNodes.length > 0) {
            setNodes([...nodes, ...newNodes])
            setEdges([...edges, ...newEdges])
            setFocusNode(newNodes[newNodes.length - 1].id)
        }
    }
    return (
        <div>
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !rounded-none !bg-stone-400"/>
            {showContent ? <div className="relative">
                <Button className="absolute -top-4 -right-4" size="icon" variant="secondary"
                        onClick={handleExpand}><Expand/></Button>
                <CimComponent equipment={data}/>
            </div> : <Placeholder/>}
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !rounded-none !bg-stone-400" id=""/>
        </div>
    )
}