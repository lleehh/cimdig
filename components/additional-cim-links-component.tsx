'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { List } from "lucide-react";
import { CIM, IdentifiedObject } from "@/lib/cim";
import useFlowStore, { selector } from "@/lib/store/store-flow";
import { useShallow } from "zustand/react/shallow";
import { getComponentById } from "@/lib/store/model-repository";
import { ComponentStatus, createEdge, createNode } from "@/lib/flow-utils";
import { Button } from "@/components/ui/button";

interface CimLinksProps {
  component: CIM
  componentRefs: ComponentStatus[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AdditionalCimLinks = ({ component, componentRefs, open, onOpenChange }: CimLinksProps) => {
  const { nodes, edges, setNodes, setEdges, setFocusNode } = useFlowStore(useShallow(selector));

  const handleSelect = async (id: string) => {
    const refComponent = await getComponentById(id)

    if (refComponent != null) {
      if (nodes.find(node => node.data.rdfId === refComponent.rdfId) === undefined) {
        const newNode = createNode(refComponent.rdfId, refComponent, 0, 0)
        const newEdge = createEdge(component.rdfId, refComponent.rdfId, true, "topHandle", "bottomHandle")
        setNodes([...nodes, newNode])
        setEdges([...edges, newEdge])
        setFocusNode(newNode.id)
      } else {
        const newEdge = createEdge(component.rdfId, refComponent.rdfId, true, "topHandle", "bottomHandle")
        setEdges([...edges, newEdge])
      }
    }

    // optional: close after selecting
    onOpenChange(false);
  }

  const filteredRefs = componentRefs.filter(
    status => (status.exists === true && status.connected === false) || status.exists === false
  )

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <List />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent className="flex flex-col space-y-2 max-h-64 overflow-y-auto">
          <DropdownMenuLabel>Links to other components</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filteredRefs.map((c) => (
            <DropdownMenuItem
              key={c.equipment.rdfId}
              onSelect={() => handleSelect(c.equipment.rdfId)}
            >
              {c.equipment.rdfType} {(c.equipment as IdentifiedObject)?.name}
              {c.exists && !c.connected ? " (Create new Link)" : ""}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

export default AdditionalCimLinks;
