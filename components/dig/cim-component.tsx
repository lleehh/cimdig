'use client'
import {
	ACLineSegment,
	Breaker,
	CIM,
	ConnectivityNode,
	GeneratingUnit,
	NonConformLoad,
	Terminal,
	BusbarSection,
	Bay,
	Substation, PowerTransformer, PowerTransformerEnd,
	Line,
	ConformLoad
} from "@/lib/cim";
import GenericComponent from "@/components/equipment/generic-component";
import { OtherData } from "@/lib/store/store-flow";
import { mediumComponentStyling, smallComponentStyling } from "./flow-component";
import { Circle, CombineIcon, Factory, HousePlug, LandPlot, Shell, SquareTerminal, Triangle } from "lucide-react";
import { ComponentIcon } from "../component-icon";
import { cimPresentationMap, defaultCimPresentation } from "@/lib/cim-presentation";


interface CimComponentProps {
	equipment: CIM
	otherData: OtherData
	collapsed?: boolean
	handleExpand: () => void
}

export default function CimComponent({ equipment, otherData, collapsed, handleExpand }: CimComponentProps) {
	const presentation =
		cimPresentationMap[equipment.rdfType] ?? defaultCimPresentation
	return (
		<GenericComponent
			equipment={equipment}
			otherData={otherData}
			collapsed={collapsed}
			handleExpand={handleExpand}
			presentation={presentation}
		/>
	)
} 
