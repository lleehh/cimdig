import {CIM, IdentifiedObject, RdfValue} from "@/models/cim";
import {JsonData} from "@/services/model-repository";

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
        "BaseVoltage|EquipmentContainer": (value: string) => ({
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
        // Find a matching processor for the key
        const processor = Object.entries(keyProcessors).find(([pattern]) =>
            new RegExp(`^(${pattern})$`).test(strippedKey)
        );

        if (processor) {
            const [, processFn] = processor;
            node[strippedKey] = processFn(value); // Apply the matching processor
        } else {
            // Default: Add as-is (or further customize here if needed)
            node[strippedKey] = value;
        }
    }

    return node as T;
}