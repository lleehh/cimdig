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



export default function ButtonBarComponent({equipment}: {equipment: CIM}) {
    const refs = componentRefs(equipment)
    const propertiyList = componentParameters(equipment)

    return (
        <div>
            <div className="w-max h-max rounded-xl  bg-card text-card-foreground absolute -top-3 right-0]" color={equipment.color?.toString()!}>
                <DisplayProperty data={propertiyList}/>
                <AdditionalCimLinks componentRefs={refs} component={equipment}/>
                <Button variant="ghost" size="icon"><Expand/></Button>
            </div>
        </div>
    )
}