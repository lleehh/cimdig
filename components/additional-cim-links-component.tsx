'use client'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button"
import {List} from "lucide-react";
import {CIM} from "@/lib/cim";
import useFlowStore, {selector} from "@/lib/store/store-flow";
import {useShallow} from "zustand/react/shallow";
import {getComponentById} from "@/lib/store/model-repository";
import {createEdge, createNode, createNodesAndEdges} from "@/lib/flow-utils";

interface CimLinksProps {
    component: CIM
    componentRefs: CIM[]
}

export default function AdditionalCimLinks({component, componentRefs}: CimLinksProps) {


    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        setFocusNode
    } = useFlowStore(useShallow(selector));


    const handleSelect = async (id: string) => {

        console.log("###############################DROPDOWN")
        const refComponent = await getComponentById(id)

        if (refComponent != null && nodes.find(node => node.data.rdfId === refComponent.rdfId) === undefined) {
            const newNode = createNode(refComponent.rdfId, refComponent, 0, 0)
            const newEdge = createEdge(component.rdfId, refComponent.rdfId, true, "topHandle", "bottomHandle")
            setNodes([...nodes, newNode])
            setEdges([...edges, newEdge])
            setFocusNode(newNode.id)
        }

    }


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild={true} className="border-solid">
                <Button variant="ghost" size="icon"><List/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col space-y-2">
                <DropdownMenuLabel>Properties</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                {componentRefs.map((component) => (
                    <DropdownMenuItem key={component.rdfId}
                                      onSelect={() => handleSelect(component.rdfId)}>{component.rdfType}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>

        </DropdownMenu>
    )
}

