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
import ACLineSegmentComponent from "@/components/equipment/aclinesegment-component";
import BreakerComponent from "@/components/equipment/breaker-component";
import ConnectivityNodeComponent from "@/components/equipment/connectivety-node-component";
import GenericComponent from "@/components/equipment/generic-component";
import TerminalComponent from "@/components/equipment/terminal-component";
import GeneratorComponent from "@/components/equipment/generator-component";
import NonConformLoadComponent from "../equipment/nonconformload-component";
import BusbarComponent from "../equipment/busbarsection-component";
import Baycomponent from "../equipment/bay-component";
import Substationcomponent from "../equipment/substation-component";
import PowerTransformerComponent from "@/components/equipment/powertransformer-component";
import PowerTransformerEndComponent from "@/components/equipment/powertransformer-end-component";
import LineComponent from "../equipment/line-component";
import ConformLoadComponent from "../equipment/conformload-component";
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
