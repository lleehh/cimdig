'use client';
import {
    ReactFlow,
    Viewport, Controls, MiniMap, Background, Panel, NodeTypes, useReactFlow
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import {Button} from "@/components/ui/button";
import FlowComponent from "@/components/dig/flow-component";
import useFlowStore, {selector} from "@/lib/store/store-flow";
import {useShallow} from "zustand/react/shallow";
import {CIM} from "@/lib/cim";
import {useCallback, useEffect} from "react";
import {createNodesAndEdges, getLayoutedElements} from "@/lib/flow-utils";

const nodeTypes = {flowContainer: FlowComponent} as NodeTypes

interface DigProps {
    equipment?: CIM | null
}

export default function Dig({equipment}: DigProps) {
    const {fitView, getNode, setCenter} = useReactFlow();

    const {
        focusNodeId,
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setNodes,
        setEdges,
    } = useFlowStore(
        useShallow(selector),
    );

    useEffect(() => {
        console.log('equipment', equipment)
        if (equipment) {
            const {nodes, edges} = createNodesAndEdges(equipment)
            setNodes(nodes)
            setEdges(edges)
        }
    }, []);

    useEffect(() => {
        console.log("######FOCUS NODE IS SET TO", focusNodeId)
        if (focusNodeId) {
            focusNodeHandle(focusNodeId)
        }
    }, [focusNodeId]);

    const onLayout = useCallback(
        (direction: string) => {
            const layouted = getLayoutedElements(nodes, edges, {direction});
            setNodes([...layouted.nodes]);
            setEdges([...layouted.edges]);

            window.requestAnimationFrame(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                // fitView({ nodes: [node], duration: 500, padding: 0.2 });
                fitView({duration: 500, padding: 0.2});
            });
        },
        [nodes, edges, setNodes, setEdges, fitView],
    )

    const focusNodeHandle = (nodeId) => {
        const layouted = getLayoutedElements(nodes, edges, {direction: 'LR'});
        setNodes([...layouted.nodes]);
        setEdges([...layouted.edges]);

        const node = layouted.nodes.find(node => node.id === nodeId)
        //const node = getNode(nodeId);
        if (node) {
            console.log("FOCUS NODE", node.position.x, node.position.y)

            setCenter(node.position.x, node.position.y, {
                zoom: 1.0, // Adjust zoom level if needed
                duration: 500, // Smooth transition
            });


            // fitView({ nodes: [node], duration: 500, padding: 0.2 });
        }
    };

    const defaultViewport: Viewport = {x: 100, y: 300, zoom: 0.8};

    return (
        <div className="relative flex flex-col h-full flex-grow">
            <ReactFlow style={{width: '100%', height: '100%'}}
                       nodes={nodes}
                       edges={edges}
                       nodeTypes={nodeTypes}
                       onNodesChange={onNodesChange}
                       onEdgesChange={onEdgesChange}
                       defaultViewport={defaultViewport}
                       onConnect={onConnect}
                       connectionLineStyle={{stroke: '#ddd', strokeWidth: 2}}
            >
                <Panel position="top-right">
                    <div
                        className={'flex space-x-2'}>
                        <Button onClick={() => onLayout('TB')}>vertical layout</Button>
                        <Button onClick={() => onLayout('LR')}>horizontal layout</Button>
                    </div>
                </Panel>
                <Background/>
                <MiniMap/>
                <Controls/>
            </ReactFlow>
        </div>
    )
}