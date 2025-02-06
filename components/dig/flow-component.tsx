import CimComponent from "@/components/dig/cim-component";
import Placeholder from "@/components/dig/placeholder";
import { Button } from "@/components/ui/button";
import {
    CIM,
    isConductingEquipment,
    isConnectivityNode,
    isTerminal  
} from "@/lib/cim";
import { createEdge, createNode, doesEquipmentExistsInFlow } from "@/lib/flow-utils";
import { isExandable } from "@/lib/services/cim-service";
import { getComponentById } from "@/lib/store/model-repository";
import useFlowStore, { CimNode, selector } from "@/lib/store/store-flow";
import { Edge, Handle, NodeProps, Position, useStore, } from "@xyflow/react";
import { Expand, FileTerminal } from "lucide-react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ComponentIcon } from '@/components/component-icon';
import { Factory, Shell } from 'lucide-react';


const zoomSelector = (s: { transform: number[]; }) => s.transform[2] >= 0.6;

function selectPlaceholder(type: string) {
    switch (type) {
        case "cim:ACLineSegment": // if the type is ACLineSegment then show an icon of an AC Line segment
            return   (
                <div className="w-44 border border-gray-400 p-3">
                        <ComponentIcon icon="overforing"/>
                </div> )
        case "cim:Terminal":
            return (
                <div className="w-44 border border-gray-400 p-3">
                    <FileTerminal/>
                </div>
            )
        case "cim:ConnectivityNode":
            return (
                <div className="w-44 border border-gray-400 p-3">
                    <Shell/>
                </div>
            )
        case "cim:Breaker":
            return (
                <div className="w-44 border border-gray-400 p-3">
                    <ComponentIcon icon="bryter"/>
                </div>
            )
        case "cim:GeneratingUnit":
            return (
                <div className="w-44 border border-gray-400 p-3">
                    <ComponentIcon icon="generator"/>
                </div>
            ) 
        case "cim:NonConformLoad":
            return (
                <div className="w-44 border border-gray-400 p-3">
                    <Factory/>
                </div>
            )    
        case "cim:BusbarSection":
            return (
                <div className="w-44 border border-gray-400 p-3">
                    <ComponentIcon icon="samleskinne"/>
                </div>
            )

        default:
            return Placeholder()
    }
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
            <Handle type="target" isConnectable={false} position={Position.Left}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="bottomHandle"/>
            {showContent ? <div className="relative">
                {!expanded && isExandableComponent &&
                    <Button className="absolute -top-4 -right-4" size="icon" variant="secondary"
                            onClick={handleExpand}><Expand/></Button>}
                <CimComponent equipment={component || data}/>
            </div> : <Placeholder/>}
            <Handle type="source" isConnectable={false} position={Position.Right}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="rightHandle"/>
            <Handle type="source" isConnectable={false} position={Position.Right}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="topHandle"/>

        </div>
    )
}