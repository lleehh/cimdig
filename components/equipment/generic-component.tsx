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
	equipment: CIM
	otherData: OtherData
	collapsed?: boolean
	handleExpand: () => void
	presentation: CimPresentation
}

export default function GenericComponent({ equipment, otherData, collapsed, handleExpand, presentation }: ConnectivetyNodeProps) {
	const title = getTitle(equipment)
	const { size, icon } = presentation

	if (collapsed)
		return (
			<>
				{colorStyling(otherData.color ?? "black")}
				<div className={`${CollapsedStyling()} flex items-center`}>
					<div className="shrink-0">
						{icon}
					</div>
					<div className="overflow-hidden text-m ml-2 truncate-text">{equipment.name as string}</div>
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
						<div className=" truncate-text text-sm font-medium">
							{title}
						</div>
					</CardTitle>
					<CardDescription>
						<>
							{equipment.name &&
								<div className={`truncate-text text-xs text-gray-400`}
									title={equipment.name as string}>{equipment.name as string}
								</div>}
						</>
					</CardDescription>
				</CardHeader>
				{equipment.description && size.name !== "smallComponentStyling" &&
					<CardContent className="flex flex-col text-gray-600">
						<div className="text-gray-400 truncate-text">{equipment.description.toString()}</div>
						{equipment.baseVoltage && (
							<span className="truncate-text"> Voltage {(equipment.baseVoltage as BaseVoltage).name}</span>
						)}
						{equipment.maxOperatingP && (
							<span className="truncate-text"> Max operating power limit {equipment.maxOperatingP.toString()}</span>
						)}

					</CardContent>
				}
			</Card>
		</div>
	)
}



