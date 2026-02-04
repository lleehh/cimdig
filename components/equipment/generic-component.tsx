'use client'
import { BaseVoltage, CIM } from "@/lib/cim";
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
import { CimPresentation } from "@/lib/cim-presentation";

interface ConnectivetyNodeProps {
	equipment: CIM
	otherData: OtherData
	collapsed?: boolean
	handleExpand: () => void
	presentation: CimPresentation
}

const abbreviatedTitles = new Map([
	["Terminal", "T1"],
	["PowerTransformer", "PT"],
	["PowerTransformerEnd", "PTE"],
	["ConnectivityNode", "CN"]
])


export default function GenericComponent({ equipment, otherData, collapsed, handleExpand, presentation }: ConnectivetyNodeProps) {
	let title = equipment.rdfType.split(":")[1]
	if (abbreviatedTitles.has(title)) title = abbreviatedTitles.get(title) ?? title
	const { size, icon } = presentation

	if (collapsed)
		return (
			<>
				{colorStyling(otherData.color ?? "black")}
				<div className={`${CollapsedStyling()} flex items-center`}>
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
							<div className="w-40 max-w-[120px] truncate overflow-hidden text-ellipsis text-sm font-medium"
							>{title}
							</div>
						</div>
					</CardTitle>
					<CardDescription>
						<>
							{equipment.name &&
								<div className={`${size()} pr-3 w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400`}
									title={equipment.name as string}>{equipment.name as string}
								</div>}
						</>
					</CardDescription>
				</CardHeader>
				{equipment.description && size.name !== "smallComponentStyling" &&
					<CardContent className="flex flex-col">
						<div className="text-gray-400">{equipment.description.toString()}</div>
						{equipment.baseVoltage && (
							<span> Voltage {(equipment.baseVoltage as BaseVoltage).name} </span>
						)}
						{equipment.maxOperatingP && (
							<span> Max operating power limit {equipment.maxOperatingP.toString()} </span>
						)}

					</CardContent>
				}
			</Card>
		</div>
	)
}



