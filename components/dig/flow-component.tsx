import {NodeProps, useStore, Handle, Position, Edge,} from "@xyflow/react";
import {
    ACLineSegment,
    Breaker,
    CIM,
    ConnectivityNode,
    GeneratingUnit, isConductingEquipment,
    isConnectivityNode,
    isTerminal,
    NonConformLoad,
    Terminal,
    BusbarSection
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
import {useEffect, useState} from "react";
import {findById, getComponentById} from "@/lib/store/model-repository";
import {createEdge, createNode, doesEquipmentExistsInFlow} from "@/lib/flow-utils";
import {isExandable} from "@/lib/services/cim-service";
import NonConformLoadComponent from "../equipment/nonconformload-component";
import BusbarComponent from "../equipment/busbarsection-component";


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
            case "cim:NonConformLoad":
                return <NonConformLoadComponent equipment={equipment as NonConformLoad}/>;
            case "cim:BusbarSection":
                return <BusbarComponent equipment={equipment as BusbarSection}/>;
            default:
                return <GenericComponent equipment={equipment}/>;
        }
    };
    return (<>
        {renderComponent()}
    </>)
}


export default function FlowComponent({data}: NodeProps<CimNode>) {
    // The fully loaded component from the database
    const [component, setComponent] = useState<CIM | null>(null);
    const [expanded, setExpanded] = useState(false);
    const showContent = useStore(zoomSelector);

    const isExandableComponent = isExandable(data)

    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        setFocusNode
    } = useFlowStore(useShallow(selector),);

    useEffect(() => {
        if (!component) {
            const loadComponent = async () => {
                setComponent(await getComponentById(data.rdfId))
            }
            loadComponent()
        }
    }, []);

    const handleExpand = async () => {
        // We need to load the full component from the database to get all the properties

        const node = nodes.find(node => node.id === component?.rdfId)
        const edge = edges.filter(edge => edge.source === component?.rdfId || edge.target === component?.rdfId)

        /*
            We have a set of different types that we will automatically render:
            terminals, connectivity nodes
         */
        console.log("EQ", component?.rdfId, component?.rdfType)
        const newNodes: CimNode[] = []
        const newEdges: Edge[] = []
        if (node && component) {
            if (isTerminal(component)) {
                if (!doesEquipmentExistsInFlow(component.connectivityNode.rdfId, nodes)) {
                    newNodes.push(createNode(component.connectivityNode.rdfId, component.connectivityNode, 0, 0))
                    //newEdges.push(createEdge(component.rdfId, component.connectivityNode.rdfId, component.sequenceNumber !== 1))
                    newEdges.push(createEdge(component.rdfId, component.connectivityNode.rdfId, true))

                }

                if (!doesEquipmentExistsInFlow(component.conductingEquipment.rdfId, nodes)) {
                    newNodes.push(createNode(component.conductingEquipment.rdfId, component.conductingEquipment, 0, 0))
                    //newEdges.push(createEdge(component.rdfId, component.conductingEquipment.rdfId, component.sequenceNumber !== 1))
                    newEdges.push(createEdge(component.rdfId, component.conductingEquipment.rdfId, true))
                }
            }
            if (isConnectivityNode(component) || isConductingEquipment(component)) {
                const rdfId = component.rdfId
                component.terminals.forEach(terminal => {
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
        setExpanded(true)
    }
    return (
        <div>
            <Handle type="target" isConnectable={false} position={Position.Left}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="leftHandle"/>
            <Handle type="target" isConnectable={false} position={Position.Bottom}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="bottomHandle"/>
            {showContent ? <div className="relative">
                {!expanded && isExandableComponent &&
                    <Button className="absolute -top-4 -right-4" size="icon" variant="secondary"
                            onClick={handleExpand}><Expand/></Button>}
                <CimComponent equipment={component || data}/>
            </div> : <Placeholder/>}
            <Handle type="source" isConnectable={false} position={Position.Right}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="rightHandle"/>
            <Handle type="source" isConnectable={false} position={Position.Top}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="topHandle"/>
        </div>
    )
}