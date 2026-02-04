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
import { getTitle } from "@/lib/utils";

interface ConnectivetyNodeProps {
	data: Data
	states: States
	presentation: CimPresentation
}

interface Data {
	equipment: CIM
	otherData: OtherData
}

interface States {
	collapsed?: boolean
	handleExpand: () => void
}

export default function GenericComponent({ data, states, presentation }: ConnectivetyNodeProps) {
	const { equipment, otherData } = data
	const { collapsed, handleExpand } = states
	const { size, icon, showDescription = false } = presentation
	const title = getTitle(data.equipment)
	const truncateClass = "truncate-text"

	if (collapsed)
		return (
			<>
				{colorStyling(otherData.color ?? "black")}
				<div className={`${CollapsedStyling()} flex items-center`}>
					<div className="shrink-0">
						{icon}
					</div>
					<div className={`text-m ml-2 ${truncateClass}`}>{equipment.name as string}</div>
				</div>
			</>
		)

	return (
		<div>
			<BtnGroupComponent equipment={equipment} handleExpand={handleExpand} />
			<Card className={size()} color={otherData.color ?? "black"}>
				<CardHeader>
					<CardTitle className="flex min-w-0 gap-2">
						<div className="shrink-0">
							{icon}
						</div>
						<div className={`${truncateClass} text-sm font-medium`}>
							{title}
						</div>
					</CardTitle>
					<CardDescription>
						<>
							{equipment.name &&
								<div className={`${truncateClass} text-xs text-gray-400`}
									title={equipment.name as string}>{equipment.name as string}
								</div>}
						</>
					</CardDescription>
				</CardHeader>
				{showDescription && (<CardContent className="flex flex-col text-gray-600">
					{showDescription && <div className={`text-gray-400 ${truncateClass}`}>{equipment.description?.toString()}</div>}
					{equipment.baseVoltage && (
						<span className={`${truncateClass}`}>Voltage {(equipment.baseVoltage as BaseVoltage).name}</span>
					)}
					{equipment.maxOperatingP && (
						<span className={`${truncateClass}`}>Operating power limit {equipment.maxOperatingP.toString()}</span>

					)}
				</CardContent>)}
			</Card>
		</div>
	)
}



