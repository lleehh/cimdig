'use client'
import CimComponent from "@/components/dig/cim-component";
import {Button} from "@/components/ui/button";
import {
    CIM,
    isConductingEquipment,
    isConnectivityNode,
    isTerminal, PowerTransformerEnd
} from "@/lib/cim";
import {
    createEdge,
    createNode,
    doesEquipmentExistsInFlow,
    createConnectingNodes,
    checkNodesForConnections
} from "@/lib/flow-utils";
import {getComponentById} from "@/lib/store/model-repository";
import useFlowStore, {CimNode, selector} from "@/lib/store/store-flow";
import {Edge, Handle, NodeProps, Position, useStore,} from "@xyflow/react";
import {Expand} from "lucide-react";
import {useEffect, useState} from "react";
import {useShallow} from "zustand/react/shallow";
import BtnGroupComponent from "../btn-group-component";
import {func} from "ts-interface-checker";

const zoomSelector = (s: { transform: number[]; }) => s.transform[2] >= 0.6;

export function CollapsedStyling() {
    return (
        "w-44 border border-gray-400 p-3 bg-white"
    )
}

export function colorStyling(color: string) {
    return (
        <div style={{backgroundColor: color ?? "black", height: "10px"}}> </div>
    )
}

export function smallComponentStyling() {
    return (
        "w-[135px]"
    )
}

export function mediumComponentStyling() {
       return (
        "w-[180px]"
    ) 
}



export default function FlowComponent({data}: NodeProps<CimNode>) {
    // The fully loaded component from the database
    const [component, setComponent] = useState<CIM | null>(null);
    const [expanded, setExpanded] = useState(false);
    const showContent = useStore(zoomSelector);

    const updateComponent = (value: any) => {
        console.log("Updating count to:", value);

        const {newNodesInfo, newEdgesInfo} = checkNodesForConnections(nodes, value)

        if(newNodesInfo.length == 0) {console.log("NO CONNECTIONS!"); data.otherData.expanded = true}
        console.log(data)

        setComponent(value);
    };

    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        setFocusNode
    } = useFlowStore(useShallow(selector),);

    useEffect(() => {
        if (!component) {
            console.log("Creating component!!!!!!!!!!!!!!!!!!!!!!!")
            const loadComponent = async () => {
                updateComponent(await getComponentById(data.cimData.rdfId))
            }
            loadComponent()

        }
    }, []);

    const handleExpand = async () => {
        console.log("Nodes:", nodes)

        console.log("\n\n\n\n\n\n")

        // We need to load the full component from the database to get all the properties

        const node = nodes.find(node => node.id === component?.rdfId)
        const edge = edges.filter(edge => edge.source === component?.rdfId || edge.target === component?.rdfId)

        /*
            We have a set of different types that we will automatically render:
            terminals, connectivity nodes
         */
        //const newNodes: CimNode[] = []
        //const newEdges: Edge[] = []

        let colors: string[] = [
            "#ff9e9e",
            "#9eadff",
            "#ea9eff",
            "#c8ff9e",
            "#ffe380",
            "#9effdd",
        ]


        if (node && component) {
            const {newNodes, newEdges} = createConnectingNodes(nodes, component)

            if (newNodes.length > 0) {
                newNodes[0].data.otherData.color = data.otherData.color
                if (newNodes.length > 1) {
                    newNodes.forEach((element, i) => {
                        element.data.otherData.color = colors[i % colors.length]
                    });
                }

                else {

                }
                setNodes([...nodes, ...newNodes])
                setEdges([...edges, ...newEdges])
                setFocusNode(newNodes[newNodes.length - 1].id)
            }
        }
        data.otherData.expanded = true
        setExpanded(true)
    }



    return (
        <div>

            <Handle type="target" isConnectable={false} position={Position.Left}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400"/>
            <Handle type="target" isConnectable={false} position={Position.Left}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="bottomHandle"/>
            <div>
                <CimComponent equipment={component || data.cimData} otherData={data.otherData} collapsed={!showContent} handleExpand={handleExpand}/>
            </div>
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !rounded-none !bg-stone-400" id=""/>
            <Handle type="source" isConnectable={false} position={Position.Right}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="topHandle"/>
        </div>
    )
}

