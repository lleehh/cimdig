'use client'
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import {Button} from "@/components/ui/button";
import {
    Card
} from "@/components/ui/card";
import {componentParameters, componentRefs, isEquipmentExpandable} from "@/lib/services/cim-service";
import {Expand} from "lucide-react";
import DisplayProperty from "./display-property-component";
import {CIM} from "@/lib/cim";
import FlowComponent from "./dig/flow-component";
import {useState} from "react";
import useFlowStore, {selector} from "@/lib/store/store-flow";
import {useShallow} from "zustand/react/shallow";
import {componentStatus} from "@/lib/flow-utils";

interface BtnGroupComponentProps {
    handleExpand: () => void
    equipment: CIM
}


export default function BtnGroupComponent({equipment, handleExpand}: BtnGroupComponentProps) {
    const refs = componentRefs(equipment)
    const propertiyList = componentParameters(equipment)
    const [expanded, setExpanded] = useState(false)

    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        setFocusNode
    } = useFlowStore(useShallow(selector));

    const expandable = isEquipmentExpandable(equipment)

    const onExpand = () => {
        setExpanded(true)
        handleExpand()
    }

    const filteredComponentRefs = refs.filter(ref =>
        !nodes.find(node => node.data.rdfId === ref.rdfId)
    ) || []

    const components = componentStatus(equipment, nodes, edges)

    const haveMoreRefs = components.filter(status => (status.exists == true && status.connected === false) || status.exists == false).length > 0

    return (
        <div>
            <div
                className="w-max h-max rounded-t-xl border-r border-t border-l bg-card text-card-foreground absolute -top-4 right-0"
                color={equipment.color?.toString()!}>
                <DisplayProperty data={propertiyList}/>
                {haveMoreRefs && <AdditionalCimLinks componentRefs={components} component={equipment}/>}
                {expandable &&
                    <Button variant="ghost" size="icon" onClick={onExpand} disabled={expanded}><Expand/></Button>}
            </div>
        </div>
    )
}