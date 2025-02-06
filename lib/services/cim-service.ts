import {CIM, isConductingEquipment} from "@/lib/cim";

export function isExandable(component: CIM): boolean {
    return component.rdfType === 'cim:ConnectivityNode'
        || component.rdfType === 'cim:Terminal'
        || isConductingEquipment(component)
}

export function sholdNotBeInComponentRefs(component: CIM): boolean {
    return component.rdfType !== 'cim:ConnectivityNode'
        && component.rdfType !== 'cim:Terminal'
        && component.rdfType !== 'cim:BaseVoltage'
}

export function componentRefs(component: CIM): CIM[] {
    const refs: CIM[] = []
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