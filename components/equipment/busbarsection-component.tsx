import { ComponentIcon } from "@/components/component-icon";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BusbarSection } from "@/lib/cim";
import { componentRefs } from "@/lib/services/cim-service";
import AdditionalCimLinks from "@/components/additional-cim-links-component";

interface BusbarProps {
    equipment: BusbarSection
}

export default function BusbarComponent({equipment}: BusbarProps) {

    const refs = componentRefs(equipment)

    return (
        <Card className="w-[230px] ">
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="samleskinne"/>
                        Busbar
                    </div>
                    <AdditionalCimLinks componentRefs={refs} component={equipment}/>
                </CardTitle>
                <CardDescription>
                    <div className="w-32 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                         title= {equipment.name}>
                        {equipment.name}
                    </div>

                </CardDescription>
            </CardHeader>
        </Card>
    )
}