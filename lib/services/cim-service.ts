import {CIM, ConductingEquipment, PowerTransformerEnd} from "@/lib/cim";

export function sholdNotBeInComponentRefs(component: CIM): boolean {
    return component.rdfType !== 'cim:ConnectivityNode'
        && component.rdfType !== 'cim:Terminal'
        && component.rdfType !== 'cim:BaseVoltage'
}

/**
 * Finds all related CIM component for "component" parameter which is not ConnectivityNody, Terminal or BaseVoltage
 * @returns Array of CIM component that is related to "component" parameter
 */
export function componentRefs(component: CIM): CIM[] {
    const refs: CIM[] = []
    // Will travese each element in "component" and check if it's an object or an array.
    // If it's an array, then it will iterate through each item and use sholdNotBeInComponentRefs to check if it is added to refs
    Object.entries(component).forEach(([key, value]) => {
        if (typeof value === "object" && !Array.isArray(value)) {
            if (sholdNotBeInComponentRefs(value)) {
                refs.push(value)
            }
        } else if (Array.isArray(value)) {
            value.forEach((item) => {
                if (sholdNotBeInComponentRefs(item)) {
                    refs.push(item)
                }
            })
        }
    })
    return refs
}


export function componentParameters(component: CIM): Record<string, String> {
    const parameters: Record<string, String> = {}
    Object.entries(component).forEach(([key, value]) => {
        if (typeof value !== "object") {
            parameters[key] = String(value)
        }
    });
    return parameters
}

export function isEquipmentExpandable(equipment: CIM) {
    const hasTerminal = (equipment as PowerTransformerEnd).terminal !== undefined;
    const terminals = (equipment as ConductingEquipment).terminals || []
    return equipment.rdfType === 'cim:ConnectivityNode'
        || equipment.rdfType === 'cim:Terminal'
        || terminals.length > 0
        || hasTerminal
}