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
import {CIM, IdentifiedObject} from "@/lib/cim";
import useFlowStore, {selector} from "@/lib/store/store-flow";
import {useShallow} from "zustand/react/shallow";
import {getComponentById} from "@/lib/store/model-repository";
import {createEdge, createNode} from "@/lib/flow-utils";
import {memo} from "react";

interface CimLinksProps {
    open: boolean
    component: CIM
    componentRefs: CIM[]
}

const AdditionalCimLinks = memo(({open, component, componentRefs}: CimLinksProps) => {

    console.log("RENDER DROPDOWN")
    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        setFocusNode
    } = useFlowStore(useShallow(selector));


    //if(!open) return null

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
    );
    /*

    return (
        componentRefs.map((component) => (
            <Button type="button" key={component.rdfId}
                    onClick={() => handleSelect(component.rdfId)}>{component.rdfType}
            </Button>
        ))
    )

     */


    return (
        <DropdownMenu open={true}>

            <DropdownMenuContent className="flex flex-col space-y-2">
                <DropdownMenuLabel>Properties</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                {filteredComponentRefs.map((component) => (
                    <DropdownMenuItem key={component.rdfId}
                                      onSelect={() => handleSelect(component.rdfId)}>{component.rdfType} {(component as IdentifiedObject)?.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>

        </DropdownMenu>
    )
})

export default AdditionalCimLinks;