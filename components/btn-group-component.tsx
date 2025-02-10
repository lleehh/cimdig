'use client'
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import { Button } from "@/components/ui/button";
import {
    Card
} from "@/components/ui/card";
import { componentParameters, componentRefs } from "@/lib/services/cim-service";
import { Expand } from "lucide-react";
import DisplayProperty from "./display-property-component";
import { CIM } from "@/lib/cim";
import FlowComponent from "./dig/flow-component";
import { useState } from "react";

interface BtnGroupComponentProps {
    handleExpand: () => void
    equipment: CIM
}


export default function BtnGroupComponent({equipment, handleExpand}: BtnGroupComponentProps) {
    const refs = componentRefs(equipment)
    const propertiyList = componentParameters(equipment)
    const [expanded, setExpanded] = useState(false)
    const onExpand = ()=> {
        setExpanded(true)
        handleExpand()
    }


    return (
        <div>
            <div className="w-max h-max rounded-t-xl border-r border-t border-l bg-card text-card-foreground absolute -top-4 right-0" color={equipment.color?.toString()!}>
                <DisplayProperty data={propertiyList}/>
                <AdditionalCimLinks componentRefs={refs} component={equipment}/>
                <Button variant="ghost" size="icon" onClick={onExpand} disabled={expanded}><Expand/></Button>
            </div>
        </div>
    )
}