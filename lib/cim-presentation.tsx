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

	},
	"cim:GeneratingUnit": {
		size: mediumComponentStyling,
		icon: <ComponentIcon icon="generator" />,
		showDescription: true
	},
	"cim:NonConformLoad": {
		size: mediumComponentStyling,
		icon: <Factory />,
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

export const componentDescriptionMap =  new Map ([
	["cim:ACLineSegment", "Represents a segment of an AC transmission or distribution line with electrical characteristics"],
    ["cim:Terminal", "Connection point where conducting equipment connects to a connectivity node"],
    ["cim:ConnectivityNode", "Point where multiple terminals are electrically connected together"],
    ["cim:Breaker", "Switching device capable of making, carrying, and breaking currents under normal and fault conditions"],
    ["cim:GeneratingUnit", "Power generation equipment that produces electrical energy"],
    ["cim:NonConformLoad", "Load that does not follow standard load response patterns, such as industrial loads"],
    ["cim:BusbarSection", "Conductor section used to connect multiple circuits at the same voltage level"],
    ["cim:Bay", "Logical grouping of equipment within a substation serving a specific function"],
    ["cim:Substation", "Facility where voltage is transformed and power is switched between transmission lines"],
    ["cim:PowerTransformer", "Equipment that transforms voltage levels between different parts of the power system"],
    ["cim:PowerTransformerEnd", "Winding or terminal end of a power transformer at a specific voltage level"],
    ["cim:Line", "Transmission or distribution line connecting two substations or nodes"],
    ["cim:ConformLoad", "Standard load that follows typical consumption patterns, such as residential loads"]
]);