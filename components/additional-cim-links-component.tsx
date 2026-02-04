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
import useFlowStore, {selector, OtherData} from "@/lib/store/store-flow";
import {useShallow} from "zustand/react/shallow";
import {getComponentById} from "@/lib/store/model-repository";
import {checkNodesForConnections, ComponentStatus, componentStatus, createEdge, createNode} from "@/lib/flow-utils";
import {Button} from "@/components/ui/button";

interface CimLinksProps {
    component: CIM
    otherData: OtherData
    componentRefs: ComponentStatus[]
}

const AdditionalCimLinks = ({component, otherData, componentRefs}: CimLinksProps) => {

    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        setFocusNode
    } = useFlowStore(useShallow(selector));


    const handleSelect = async (id: string) => {

        const refComponent = await getComponentById(id)

        if (refComponent != null) {
            if (nodes.find(node => node.data.rdfId === refComponent.rdfId) === undefined) {
                const newNode = createNode(refComponent.rdfId, refComponent, 0, 0, "#bdbdbd")
                const newEdge = createEdge(component.rdfId, refComponent.rdfId, true, "topHandle", "bottomHandle")
                setNodes([...nodes, newNode])
                setEdges([...edges, newEdge])
                setFocusNode(newNode.id)

                if (checkNodesForConnections([...nodes, newNode], component).newNodesInfo.length == 0) {otherData.expanded = true}

            } else {
                console.log("COnnect to existsing ")
                const newEdge = createEdge(component.rdfId, refComponent.rdfId, true, "topHandle", "bottomHandle")
                setEdges([...edges, newEdge])
            }
        }

    }

    const filteredRefs = componentRefs.filter(status => (status.exists == true && status.connected === false) || status.exists == false)


    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild={true}>
                <Button variant="ghost" size="icon">
                    <List/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
                <DropdownMenuContent className="flex flex-col space-y-2 max-h-64 overflow-y-auto">
                    <DropdownMenuLabel>Links to other components</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <>
                        {filteredRefs.map((component) => (
                            <DropdownMenuItem key={component.equipment.rdfId}
                                              onSelect={() => handleSelect(component.equipment.rdfId)}>
                                {component.equipment.rdfType} {(component.equipment as IdentifiedObject)?.name}
                                {component.exists && !component.connected ? "(Create new Link)" : ""}
                            </DropdownMenuItem>
                        ))}
                    </>
                </DropdownMenuContent>
            </DropdownMenuPortal>
        </DropdownMenu>
    )
}

export default AdditionalCimLinks;