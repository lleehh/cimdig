import { ReactElement } from "react";
import {
    Circle,
    Factory,
    Gauge,
    Globe,
    HousePlug,
    LandPlot,
    ListChecks,
    Map as MapIcon,
    MapPin,
    Radio,
    Shell,
    SlidersHorizontal,
    SquareTerminal,
    Triangle,
    Users,
    Zap,
    ZapOff,
} from "lucide-react";
import { mediumComponentStyling, smallComponentStyling } from "../components/dig/flow-component";
import { ComponentIcon } from "../components/component-icon";
import { CIM, GeneratingUnit, NonConformLoad, PowerTransformer } from "./cim";

export interface CimPresentation {
    size: () => string;
    icon: ReactElement;
    showDescription?: boolean;
}

export const cimPresentationMap: Record<string, CimPresentation> = {
    "cim:ACLineSegment": {
        size: mediumComponentStyling,
        icon: <ComponentIcon icon="ledningssegment" />,
    },
    "cim:Terminal": {
        size: smallComponentStyling,
        icon: <SquareTerminal />,
    },
    "cim:ConnectivityNode": {
        size: smallComponentStyling,
        icon: <Shell />,
    },
    "cim:Breaker": {
        size: mediumComponentStyling,
        icon: <ComponentIcon icon="bryter" />,
    },
    "cim:GeneratingUnit": {
        size: mediumComponentStyling,
        icon: <ComponentIcon icon="generator" />,
        showDescription: true,
    },
    "cim:NonConformLoad": {
        size: mediumComponentStyling,
        icon: <Factory />,
        showDescription: true,
    },
    "cim:BusbarSection": {
        size: mediumComponentStyling,
        icon: <ComponentIcon icon="samleskinne" />,
    },
    "cim:Bay": {
        size: mediumComponentStyling,
        icon: <LandPlot />,
        showDescription: true,
    },
    "cim:Substation": {
        size: mediumComponentStyling,
        icon: <ComponentIcon icon="stasjon" />,
    },
    "cim:PowerTransformer": {
        size: smallComponentStyling,
        icon: <ComponentIcon icon="transformator" />,
    },
    "cim:PowerTransformerEnd": {
        size: smallComponentStyling,
        icon: <Circle />,
    },
    "cim:Line": {
        size: smallComponentStyling,
        icon: <ComponentIcon icon="overforing" />,
    },

    "cim:ConformLoad": {
        size: mediumComponentStyling,
        icon: <HousePlug />,
        showDescription: true,
    },

    "cim:SynchronousMachine": {
        size: mediumComponentStyling,
        icon: <ComponentIcon icon="synkrontproduksjonsanlegg" />,
        showDescription: true,
    },
    "cim:Disconnector": {
        size: mediumComponentStyling,
        icon: <ComponentIcon icon="bryter" />,
    },
    "cim:LinearShuntCompensator": {
        size: mediumComponentStyling,
        icon: <ComponentIcon icon="kondensator" />,
        showDescription: true,
    },
    "cim:RatioTapChanger": {
        size: mediumComponentStyling,
        icon: <SlidersHorizontal />,
    },
    "cim:RegulatingControl": {
        size: mediumComponentStyling,
        icon: <Gauge />,
    },
    "cim:CurrentLimit": {
        size: mediumComponentStyling,
        icon: <Zap />,
    },
    "cim:VoltageLimit": {
        size: mediumComponentStyling,
        icon: <ZapOff />,
    },
    "cim:OperationalLimitSet": {
        size: mediumComponentStyling,
        icon: <ListChecks />,
    },
    "cim:GeographicalRegion": {
        size: mediumComponentStyling,
        icon: <Globe />,
    },
    "cim:SubGeographicalRegion": {
        size: mediumComponentStyling,
        icon: <MapPin />,
    },
    "cim:VoltageLevel": {
        size: mediumComponentStyling,
        icon: <ComponentIcon icon="felt" />,
    },
    "cim:ConformLoadGroup": {
        size: mediumComponentStyling,
        icon: <Users />,
    },
    "cim:ControlArea": {
        size: mediumComponentStyling,
        icon: <Radio />,
    },
    "cim:LoadArea": {
        size: mediumComponentStyling,
        icon: <MapIcon />,
    },
};

export const defaultCimPresentation: CimPresentation = {
    size: mediumComponentStyling,
    icon: <Triangle />,
};

export const componentDescriptionMap = new Map([
    [
        "cim:ACLineSegment",
        "Represents a segment of an AC transmission or distribution line with electrical characteristics",
    ],
    ["cim:Terminal", "Connection point where conducting equipment connects to a connectivity node"],
    ["cim:ConnectivityNode", "Point where multiple terminals are electrically connected together"],
    [
        "cim:Breaker",
        "Switching device capable of making, carrying, and breaking currents under normal and fault conditions",
    ],
    ["cim:GeneratingUnit", "Power generation equipment that produces electrical energy"],
    [
        "cim:NonConformLoad",
        "Load that does not follow standard load response patterns, such as industrial loads",
    ],
    [
        "cim:BusbarSection",
        "Conductor section used to connect multiple circuits at the same voltage level",
    ],
    ["cim:Bay", "Logical grouping of equipment within a substation serving a specific function"],
    [
        "cim:Substation",
        "Facility where voltage is transformed and power is switched between transmission lines",
    ],
    [
        "cim:PowerTransformer",
        "Equipment that transforms voltage levels between different parts of the power system",
    ],
    [
        "cim:PowerTransformerEnd",
        "Winding or terminal end of a power transformer at a specific voltage level",
    ],
    ["cim:Line", "Transmission or distribution line connecting two substations or nodes"],
    [
        "cim:ConformLoad",
        "Standard load that follows typical consumption patterns, such as residential loads",
    ],
    [
        "cim:SynchronousMachine",
        "Rotating machine that converts mechanical energy to electrical energy, or vice versa, operating in synchronism with the network",
    ],
    [
        "cim:Disconnector",
        "Switching device used to isolate equipment for maintenance, not designed to interrupt load current",
    ],
    [
        "cim:LinearShuntCompensator",
        "Shunt capacitor or reactor with linear characteristics used for reactive power compensation",
    ],
    [
        "cim:RatioTapChanger",
        "Tap changer on a power transformer that adjusts the voltage ratio between windings",
    ],
    [
        "cim:RegulatingControl",
        "Control system that regulates voltage or reactive power at a specific point in the network",
    ],
    [
        "cim:CurrentLimit",
        "Operational limit specifying the maximum allowable current for a piece of equipment",
    ],
    [
        "cim:VoltageLimit",
        "Operational limit specifying the maximum or minimum allowable voltage at a point in the network",
    ],
    [
        "cim:OperationalLimitSet",
        "Set of operational limits (current, voltage, power) associated with a terminal or equipment",
    ],
    [
        "cim:GeographicalRegion",
        "Top-level geographical region used to organize the power system model by area",
    ],
    [
        "cim:SubGeographicalRegion",
        "Subdivision of a geographical region, typically containing substations and lines",
    ],
    ["cim:VoltageLevel", "Collection of equipment at a common voltage level within a substation"],
    [
        "cim:ConformLoadGroup",
        "Group of conform loads that share the same load response characteristics and scheduling",
    ],
    [
        "cim:ControlArea",
        "Area of the power system where generation and interchange are controlled to maintain scheduled flows",
    ],
    [
        "cim:LoadArea",
        "Area of the power system used to aggregate and manage electrical load for planning and operation",
    ],
]);
