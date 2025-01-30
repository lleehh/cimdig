import {ACLineSegment} from "@/models/cim";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {AudioWaveform} from "lucide-react";
import {cn} from "@/lib/utils";
import {ComponentIcon} from "@/components/component-icon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

interface EquipmentProps {
    equipment: ACLineSegment
}

const dropdownList = [
    "rdfType:",
    "bhc:",
]

const dropdownItems = dropdownList.map((item) => {return <DropdownMenuLabel key={item}>{item}</DropdownMenuLabel>});


export default function ACLineSegmentComponent({equipment}: EquipmentProps) {

    const infoList = [
        equipment.rdfType,
        equipment.bch.toString(),
    ]

    const equipmentInfo = infoList.map((item) => {return <DropdownMenuLabel key={item}>{item}</DropdownMenuLabel>});

    return (
        <Card className="w-[350px] ">
            <CardHeader>
                <CardTitle>
                    <div className="flex flex-row items-center gap-2">
                        <ComponentIcon icon="overforing"/>
                        {equipment.name}
                    </div>
                </CardTitle>
                <CardDescription>{equipment.description}</CardDescription>
                <CardDescription>{equipment.rdfId}</CardDescription>
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
            <CardContent >
                <DropdownMenu >
                        <DropdownMenuTrigger className="border-solid">
                            <div className="border-2 border-black">Actions</div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {dropdownItems} {equipmentInfo}
                        </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
            <CardFooter className="text-green-400">
                {equipment.rdfType}
            </CardFooter>
        </Card>
    )
}