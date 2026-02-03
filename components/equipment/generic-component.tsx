'use client'
import { CIM } from "@/lib/cim";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card"
import { Triangle } from "lucide-react";
import { CollapsedStyling } from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";
import { colorStyling } from "../dig/flow-component";
import { OtherData } from "@/lib/store/store-flow";
import { ReactElement } from "react";

interface ConnectivetyNodeProps {
	equipment: CIM
	otherData: OtherData
	collapsed?: boolean
	handleExpand: () => void
	size: () => string
	icon: ReactElement
}


export default function GenericComponent({ equipment, otherData, collapsed, handleExpand, size, icon }: ConnectivetyNodeProps) {

	if (collapsed)
		return (
			<>
				{colorStyling(otherData.color ?? "black")}
				<div className={`${CollapsedStyling()} flex items-center`}>
					// TODO: check if this works. may have to have another icon for small
					{icon}
					<div className="overflow-hidden text-m ml-2">{equipment.name as string}</div>
				</div>
			</>
		)

	return (
		<div>
			<BtnGroupComponent equipment={equipment} handleExpand={handleExpand} />
			<Card className={size()} color={otherData.color ?? "black"}>
				<CardHeader>
					<CardTitle className="flex justify-between">
						<div className="flex flex-row items-center gap-2">
							{icon}
							<div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
								title={equipment.rdfType as string}>{equipment.rdfType}
							</div>
						</div>
					</CardTitle>
					<CardDescription>
						<>
							{equipment.name &&
								<div className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
									title={equipment.name as string}>{equipment.name as string}
								</div>}
						</>
					</CardDescription>
				</CardHeader>
				{equipment.description &&
					<CardContent className="flex flex-col">
                    	<div className="text-gray-400">{equipment.description}</div>
                	</CardContent>
				}
			</Card>
		</div>
	)
}



