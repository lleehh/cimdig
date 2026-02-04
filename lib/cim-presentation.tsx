import { ReactElement } from "react"
import {
	Circle,
	Factory,
	HousePlug,
	LandPlot,
	Shell,
	SquareTerminal,
	Triangle
} from "lucide-react"
import { mediumComponentStyling, smallComponentStyling } from "../components/dig/flow-component"
import { ComponentIcon } from "../components/component-icon";
import { CIM, GeneratingUnit, NonConformLoad, PowerTransformer } from "./cim";

export interface CimPresentation {
	size: () => string
	icon: ReactElement
	// content?: (equipment: CIM) => string
	showDescription?: boolean
}

export const cimPresentationMap: Record<string, CimPresentation> = {
	"cim:ACLineSegment": {
		size: mediumComponentStyling,
		icon: <ComponentIcon icon="ledningssegment" />,
	},
	"cim:Terminal": {
		size: smallComponentStyling,
		icon: <SquareTerminal />
	},
	"cim:ConnectivityNode": {
		size: smallComponentStyling,
		icon: <Shell />
	},
	"cim:Breaker": {
		size: mediumComponentStyling,
		icon: <ComponentIcon icon="bryter" />,
		// content: (equipment) => {
		// 	const pt = equipment as PowerTransformer
		// 	return pt.baseVoltage ? `Voltage ${pt.baseVoltage.name}` : ""
		// }

	},
	"cim:GeneratingUnit": {
		size: mediumComponentStyling,
		icon: <ComponentIcon icon="generator" />,
		// content: (equipment) => {
		// 	const pt = equipment as GeneratingUnit
		// 	return pt.baseVoltage ? `Max operating power limit ${pt.maxOperatingP}` : ""
		// },
		showDescription: true
	},
	"cim:NonConformLoad": {
		size: mediumComponentStyling,
		icon: <Factory />,
		// content: (equipment) => {
		// 	const pt = equipment as NonConformLoad
		// 	return pt.baseVoltage ? `Voltage ${pt.baseVoltage.name}` : ""
		// },
		showDescription: true
	},
	"cim:BusbarSection": {
		size: mediumComponentStyling,
		icon: <ComponentIcon icon="samleskinne" />
	},
	"cim:Bay": {
		size: mediumComponentStyling,
		icon: <LandPlot />,
		showDescription: true
	},
	"cim:Substation": {
		size: mediumComponentStyling,
		icon: <ComponentIcon icon="stasjon" />
	},
	"cim:PowerTransformer": {
		size: smallComponentStyling,
		icon: <ComponentIcon icon="transformator" />

	},
	"cim:PowerTransformerEnd": {
		size: smallComponentStyling,
		icon: <Circle />
	},
	"cim:Line": {
		size: smallComponentStyling,
		icon: <ComponentIcon icon="overforing" />
	},

	"cim:ConformLoad": {
		size: mediumComponentStyling,
		icon: <HousePlug />,
		showDescription: true
	}
}

export const defaultCimPresentation: CimPresentation = {
	size: mediumComponentStyling,
	icon: <Triangle />
}
