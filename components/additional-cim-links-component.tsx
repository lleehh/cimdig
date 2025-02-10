'use client'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {List} from "lucide-react";
import {CIM, IdentifiedObject} from "@/lib/cim";
import useFlowStore, {selector} from "@/lib/store/store-flow";
import {useShallow} from "zustand/react/shallow";
import {getComponentById} from "@/lib/store/model-repository";
import {createEdge, createNode} from "@/lib/flow-utils";
import {Button} from "@/components/ui/button";

interface CimLinksProps {
    component: CIM
    componentRefs: CIM[]
}

const AdditionalCimLinks = ({component, componentRefs}: CimLinksProps) => {

    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        setFocusNode
    } = useFlowStore(useShallow(selector));


    const handleSelect = async (id: string) => {

        const refComponent = await getComponentById(id)

        if (refComponent != null && nodes.find(node => node.data.rdfId === refComponent.rdfId) === undefined) {
            const newNode = createNode(refComponent.rdfId, refComponent, 0, 0)
            const newEdge = createEdge(component.rdfId, refComponent.rdfId, true, "topHandle", "bottomHandle")
            setNodes([...nodes, newNode])
            setEdges([...edges, newEdge])
            setFocusNode(newNode.id)
        }

    }
    const filteredComponentRefs = componentRefs.filter(ref =>
        !nodes.find(node => node.data.rdfId === ref.rdfId)
    ) || []

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild={true}>
                <Button variant="ghost" size="icon">
                    <List/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
                <DropdownMenuContent className="flex flex-col space-y-2 max-h-64 overflow-y-auto">
                    <DropdownMenuLabel>Properties</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <>
                        {filteredComponentRefs.map((component) => (
                            <DropdownMenuItem key={component.rdfId}
                                              onSelect={() => handleSelect(component.rdfId)}>{component.rdfType} {(component as IdentifiedObject)?.name}
                            </DropdownMenuItem>
                        ))}
                    </>
                </DropdownMenuContent>
            </DropdownMenuPortal>
        </DropdownMenu>
    )
}

export default AdditionalCimLinks;