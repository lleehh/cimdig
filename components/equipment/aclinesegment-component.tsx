import {ACLineSegment, BaseVoltage} from "@/models/cim";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {ComponentIcon} from "@/components/component-icon";
import AdditionalCimLinks from "../additional-cim-links-component";

interface EquipmentProps {
    equipment: ACLineSegment
}

export default function ACLineSegmentComponent({equipment}: EquipmentProps) {

    return (
        <Card className="w-[350px] ">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="overforing"/>
                        {equipment.name}

                        <AdditionalCimLinks/>

                    </div>
                </CardTitle>
                <CardDescription className="flex flex-col space-y-4">
                    <div className="text-gray-400">{equipment.description}</div>
                    <div>
                        Voltage {(equipment.baseVoltage as BaseVoltage).name}
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-w-md mx-auto p-4 ">
                    <div className="space-y-2">
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium text-gray-700">Bc</span>
                            <span className="text-gray-900">{equipment.bch}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="font-medium text-gray-700">Agregate</span>
                            <span className="text-gray-900">{equipment.aggregate ? "True" : "False"}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="text-green-400">
                {equipment.rdfType}
            </CardFooter>
        </Card>
    )
}