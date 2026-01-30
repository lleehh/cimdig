/**
 * CIM Component Descriptions
 * Provides human-readable explanations for various CIM (Common Information Model) components
 */

export const CIM_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
    "cim:Substation": {
        title: "Substation",
        description: "A collection of equipment for switching, transforming, or regulating electric power. Substations are key nodes in the power grid where voltage is transformed and power is distributed."
    },
    "cim:Terminal": {
        title: "Terminal",
        description: "A connection point where conducting equipment connects to a connectivity node. Terminals represent the physical connection points of electrical equipment in the network."
    },
    "cim:PowerTransformer": {
        title: "Power Transformer",
        description: "An electrical device consisting of two or more coupled windings, with or without a magnetic core, for transforming electrical power between voltage levels. Essential for transmitting power efficiently over long distances."
    },
    "cim:ACLineSegment": {
        title: "AC Line Segment",
        description: "A wire or combination of wires, with consistent characteristics, used to carry alternating current between nodes in the power grid. Represents overhead lines or underground cables."
    },
    "cim:Breaker": {
        title: "Breaker (Circuit Breaker)",
        description: "A mechanical switching device capable of making, carrying, and breaking currents under normal circuit conditions. Used for protection and isolation of electrical circuits."
    },
    "cim:BusbarSection": {
        title: "Busbar Section",
        description: "A conductor, or group of conductors, that serves as a common connection for two or more circuits. Busbars are used to collect and distribute electrical power in substations."
    },
    "cim:ConnectivityNode": {
        title: "Connectivity Node",
        description: "A point in the network where terminals of conducting equipment are connected together with zero impedance. Represents electrical connection points in network topology."
    },
    "cim:ConformLoad": {
        title: "Conform Load",
        description: "A load that follows a specific load model and whose behavior conforms to defined patterns. Typically represents aggregated loads whose behavior is predictable."
    },
    "cim:NonConformLoad": {
        title: "Non-Conform Load",
        description: "A load that does not follow a standard load model. Represents individual or special loads with unpredictable behavior patterns."
    },
    "cim:GeneratingUnit": {
        title: "Generating Unit",
        description: "A single power generation unit that can convert mechanical energy into electrical energy. Can be part of a power plant and represents individual generators."
    },
    "cim:Line": {
        title: "Line",
        description: "A physical transmission or distribution line that connects substations or nodes in the power system. Contains one or more line segments."
    },
    "cim:Bay": {
        title: "Bay",
        description: "A collection of equipment within a substation that forms a connection point to a line, transformer, or other equipment. Represents a logical grouping of equipment in a substation."
    },
    "cim:PowerTransformerEnd": {
        title: "Power Transformer End",
        description: "A terminal connection point of a power transformer representing one winding. Each transformer has multiple ends corresponding to its windings (primary, secondary, etc.)."
    },
};

/**
 * Get description for a CIM component type
 * @param rdfType - The RDF type identifier (e.g., "cim:Substation")
 * @returns The description object or null if not found
 */
export function getCIMDescription(rdfType: string): { title: string; description: string } | null {
    return CIM_DESCRIPTIONS[rdfType] || null;
}

/**
 * Check if a CIM component type has a description
 * @param rdfType - The RDF type identifier
 * @returns true if description exists, false otherwise
 */
export function hasCIMDescription(rdfType: string): boolean {
    return rdfType in CIM_DESCRIPTIONS;
}
