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




export interface CimPresentation {
	size: () => string
	icon: ReactElement
}

export const cimPresentationMap: Record<string, CimPresentation> = {
	"cim:ACLineSegment": {
		size: mediumComponentStyling,
		icon: <ComponentIcon icon="ledningssegment" />
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
		icon: <ComponentIcon icon="bryter" />
	},
	"cim:GeneratingUnit": {
		size: mediumComponentStyling,
		icon: <ComponentIcon icon="generator" />
	},
	"cim:NonConformLoad": {
		size: mediumComponentStyling,
		icon: <Factory />
	},
	"cim:BusbarSection": {
		size: mediumComponentStyling,
		icon: <ComponentIcon icon="samleskinne" />
	},
	"cim:Bay": {
		size: mediumComponentStyling,
		icon: <LandPlot />

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
		icon: <HousePlug />
	}
}
export const defaultCimPresentation: CimPresentation = {
	size: mediumComponentStyling,
	icon: <Triangle />
}
