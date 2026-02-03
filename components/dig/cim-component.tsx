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


interface CimComponentProps {
	equipment: CIM
	otherData: OtherData
	collapsed?: boolean
	handleExpand: () => void
}



export default function CimComponent({ equipment, otherData, collapsed, handleExpand }: CimComponentProps) {
	function genericMaker(equipment, size, icon) {
		return <GenericComponent equipment={equipment} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand} size={size} icon={icon} />
	}
	const renderComponent = () => {
		switch (equipment.rdfType) {
			case "cim:ACLineSegment":
				return genericMaker(equipment as ACLineSegment, mediumComponentStyling, <ComponentIcon icon="ledningssegment" />)
			case "cim:Terminal":
				return genericMaker(equipment as Terminal, smallComponentStyling, <SquareTerminal />)
			case "cim:ConnectivityNode":
				return genericMaker(equipment as ConnectivityNode, smallComponentStyling, <Shell />)
			case "cim:Breaker":
				return genericMaker(equipment as Breaker, mediumComponentStyling, <ComponentIcon icon="bryter" />)
			case "cim:GeneratingUnit":
				return genericMaker(equipment as GeneratingUnit, mediumComponentStyling, <ComponentIcon icon="generator" />)
			case "cim:NonConformLoad":
				return genericMaker(equipment as NonConformLoad, mediumComponentStyling, <Factory />)
			case "cim:BusbarSection":
				return genericMaker(equipment as BusbarSection, mediumComponentStyling, <ComponentIcon icon="samleskinne" />)
			case "cim:Bay":
				return genericMaker(equipment as Bay, mediumComponentStyling, <LandPlot />)
			case "cim:Substation":
				return genericMaker(equipment as Substation, mediumComponentStyling, <ComponentIcon icon="stasjon" />)
			case "cim:PowerTransformer":
				return genericMaker(equipment as PowerTransformer, smallComponentStyling, <ComponentIcon icon="transformator" />)
			case "cim:PowerTransformerEnd":
				return genericMaker(equipment as PowerTransformerEnd, smallComponentStyling, <Circle />)
			case "cim:Line":
				return genericMaker(equipment as Line, smallComponentStyling, <ComponentIcon icon="overforing" />)
			case "cim:ConformLoad":
				return genericMaker(equipment as ConformLoad, mediumComponentStyling, <HousePlug />)
			default:
				return genericMaker(equipment, mediumComponentStyling, <Triangle />)
		}
	};

	return (
		<>

			{renderComponent()}
		</>)
} 
