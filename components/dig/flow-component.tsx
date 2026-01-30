'use client'
import CimComponent from "@/components/dig/cim-component";
import {Button} from "@/components/ui/button";
import {
    CIM,
    isConductingEquipment,
    isConnectivityNode,
    isTerminal, PowerTransformerEnd
} from "@/lib/cim";
import {createEdge, createNode, doesEquipmentExistsInFlow} from "@/lib/flow-utils";
import {getComponentById} from "@/lib/store/model-repository";
import useFlowStore, {CimNode, selector} from "@/lib/store/store-flow";
import {Edge, Handle, NodeProps, Position, useStore,} from "@xyflow/react";
import {Expand} from "lucide-react";
import {useEffect, useState} from "react";
import {useShallow} from "zustand/react/shallow";
import BtnGroupComponent from "../btn-group-component";

const zoomSelector = (s: { transform: number[]; }) => s.transform[2] >= 0.6;

export function CollapsedStyling() {
    return (
        "w-44 border border-gray-400 p-3 bg-white"
    )
}

export function colorStyling(CIM: CIM) {
    return (
        <div style={{backgroundColor: CIM.color?.toString()!, height: "10px"}}> </div>
    )
}



export default function FlowComponent({data}: NodeProps<CimNode>) {
    // The fully loaded component from the database
    const [component, setComponent] = useState<CIM | null>(null);
    const [expanded, setExpanded] = useState(false);
    const showContent = useStore(zoomSelector);

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
        const newNodes: CimNode[] = []
        const newEdges: Edge[] = []

        let colors: string[] = [
            "#ff9e9e",
            "#9eadff",
            "#ea9eff",
            "#c8ff9e",
            "#ffe380",
            "#9effdd",
        ]


        data.color = data.color?.toString()!

        if (node && component) {
            if (isTerminal(component)) {
                if (!doesEquipmentExistsInFlow(component.connectivityNode.rdfId, nodes)) {
                    newNodes.push(createNode(component.connectivityNode.rdfId, component.connectivityNode, 0, 0, data.color?.toString()!))
                    newEdges.push(createEdge(component.rdfId, component.connectivityNode.rdfId, true))

                }

                if (!doesEquipmentExistsInFlow(component.conductingEquipment.rdfId, nodes)) {
                    newNodes.push(createNode(component.conductingEquipment.rdfId, component.conductingEquipment, 0, 0, data.color?.toString()!))
                    newEdges.push(createEdge(component.rdfId, component.conductingEquipment.rdfId, true))
                }
            }
            if (isConnectivityNode(component) || isConductingEquipment(component)) {
                const rdfId = component.rdfId
                let terminals = component.terminals || []
                if(terminals.length == 0 && (component as PowerTransformerEnd).terminal != undefined)
                    terminals = [(component as PowerTransformerEnd).terminal]
                console.log(terminals)
                terminals.forEach(terminal => {
                    if (!doesEquipmentExistsInFlow(terminal.rdfId, nodes)) {
                        newNodes.push(createNode(terminal.rdfId, terminal, 0, 0, data.color?.toString()!))
                        newEdges.push(createEdge(terminal.rdfId, rdfId, false))
                    }
                })
            }
        }
        if (newNodes.length > 0) {


            if (newNodes.length > 1) {
                newNodes.forEach((element, i) => {
                    element.data.color = colors[i%colors.length]
                });
            }
            setNodes([...nodes, ...newNodes])
            setEdges([...edges, ...newEdges])
            setFocusNode(newNodes[newNodes.length - 1].id)
        }
        setExpanded(true)
    }

    if (component !== null) {
        component.color = data.color
    }


    return (
        <div>

            <Handle type="target" isConnectable={false} position={Position.Left}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400"/>
            <Handle type="target" isConnectable={false} position={Position.Left}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="bottomHandle"/>
            <div>
                <CimComponent equipment={component || data} collapsed={!showContent} handleExpand={handleExpand}/>
            </div>
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !rounded-none !bg-stone-400" id=""/>
            <Handle type="source" isConnectable={false} position={Position.Right}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="topHandle"/>
        </div>
    )
}

