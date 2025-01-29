import {CIM, ConductingEquipment, IdentifiedObject, RdfValue} from "@/models/cim";
import {JsonData} from "@/services/model-repository";

function setFirstCharToLowercase(str: string): string {
    if (!str) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Converts raw JSON data into a domain-specific BaseNode object dynamically.
 *
 * @param rdfId - The unique ID of the node (key in the JSON object).
 * @param data - The raw JSON data to be converted.
 * @returns A structured BaseNode object.
 */
export function convertToCimObject<T extends IdentifiedObject>(rdfId: string, data: JsonData): T {
    const node: CIM = {rdfId, rdfType: data["rdfType"]};

    // Define rules for specific key patterns
    const keyProcessors: Record<string, (value: string) => RdfValue> = {
        "baseVoltage|equipmentContainer": (value: string) => ({
            id: value.replace("#", ""),
        }), // Convert to Link type
        "aggregate|normallyInService": (value: string) => value === "true", // Convert to boolean
        "bch|r|x|length": (value: string) => parseFloat(value), // Convert to number
    };


    for (const [key, value] of Object.entries(data)) {
        // Strip prefix (e.g., "cim:")
        const strippedKey =
            key.includes(":") && !key.startsWith("rdf") // Don't strip if it's `rdfType`
                ? key.replace(/^cim:[^:]*\./, "") // Removes the prefix and first segment (e.g., `cim:ACLineSegment.` -> `description`)
                : key;
        const parameter  = setFirstCharToLowercase(strippedKey);
        // Find a matching processor for the key
        const processor = Object.entries(keyProcessors).find(([pattern]) =>
            new RegExp(`^(${pattern})$`).test(parameter)
        );

        if (processor) {
            const [, processFn] = processor;
            node[parameter] = processFn(value); // Apply the matching processor
        } else {
            // Default: Add as-is (or further customize here if needed)
            node[parameter] = value;
        }
    }

    return node as T;
}

export function isConductingEquipment(equipment: IdentifiedObject): equipment is ConductingEquipment {
    return (equipment as ConductingEquipment).baseVoltage !== undefined;
}