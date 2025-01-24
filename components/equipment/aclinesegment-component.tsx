import {ACLineSegment} from "@/models/cim";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AudioWaveform} from "lucide-react";

interface EquipmentProps {
    equipment: ACLineSegment
}

export default function ACLineSegmentComponent({equipment}: EquipmentProps) {

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <AudioWaveform/>
                        {equipment.name}
                    </div>
                </CardTitle>
                <CardDescription>{equipment.description}</CardDescription>
                <CardDescription>{equipment.rdfId}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-w-md mx-auto p-4">
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
        </Card>
    )
}