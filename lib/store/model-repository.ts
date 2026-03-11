"use server";
import path from "path";
import fs from "fs/promises";
import { convertToCimObject } from "@/lib/services/transform-cim-service";
import { IdentifiedObject } from "@/lib/cim";

export type JsonData = Record<string, string>;
export type SearchResult = { name: string; id: string; rdfType: string }[];

const dataDir = path.join(process.cwd(), "models", "nordic44");

let byIdData: JsonData | null = null;
let byNameData: JsonData | null = null;

const readJsonFile = async (filename: string): Promise<JsonData> => {
    const filePath = path.join(dataDir, filename);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
};

export const findById = async (id: string): Promise<JsonData | null> => {
    if (byIdData === null) {
        byIdData = await readJsonFile("nordic44_cgm_37a_eq_by_id.json");
    }
    return typeof byIdData[id] === "object" && byIdData[id] !== null
        ? (byIdData[id] as JsonData)
        : null;
};

export const findByName = async (name: string): Promise<JsonData | null> => {
    if (byNameData === null) {
        byNameData = await readJsonFile("nordic44_cgm_37a_eq_by_name.json");
    }
    return typeof byNameData[name] === "object" && byNameData[name] !== null
        ? (byNameData[name] as JsonData)
        : null;
};

export const searchByName = async (query: string, rdfType?: string): Promise<SearchResult> => {
    if (byNameData === null) {
        byNameData = await readJsonFile("nordic44_cgm_37a_eq_by_name.json");
    }
    const result: SearchResult = [];
    for (const key in byNameData) {
        if (key.toLowerCase().startsWith(query.toLowerCase())) {
            const data = byNameData[key];
            const mRID = data["mRID"];
            const dataRdfType = data["rdfType"];
            if (rdfType && dataRdfType !== rdfType) continue;
            if (mRID)
                result.push({
                    name: key,
                    id: mRID,
                    rdfType: dataRdfType as string,
                });
        }
    }
    return result;
};

export const getComponentById = async <T extends IdentifiedObject>(
    rdfId: string
): Promise<T | null> => {
    const data = await findById(rdfId);
    if (data == null) {
        return null;
    } else {
        return convertToCimObject<T>(rdfId, data);
    }
};

/**
 * Result of loading all components within a substation.
 * Contains the full hierarchy: Substation -> VoltageLevels -> Bays -> Equipment -> Terminals -> ConnectivityNodes
 */
export interface SubstationComponents {
    substation: IdentifiedObject;
    /** Voltage levels with their associated bay IDs */
    voltageLevels: { vl: IdentifiedObject; bayIds: string[] }[];
    /** All equipment, terminals, and connectivity nodes within the substation */
    components: IdentifiedObject[];
    /** Set of connectivity node mRIDs that are internal to the substation */
    internalCNIds: string[];
    /** Maps component mRID -> container info for visual grouping */
    containerInfo: Record<
        string,
        { containerName: string; containerType: string; vlName?: string }
    >;
}

/**
 * Loads all components within a substation, stopping at the substation boundary.
 * Walks the hierarchy: Substation -> VoltageLevels -> Bays -> Equipment -> Terminals,
 * and collects all ConnectivityNodes internal to the substation's voltage levels.
 */
export const getSubstationComponents = async (
    substationId: string
): Promise<SubstationComponents | null> => {
    const substation = await getComponentById<IdentifiedObject>(substationId);
    if (!substation) return null;

    const components: IdentifiedObject[] = [];
    const internalCNIds: string[] = [];
    const containerInfo: Record<
        string,
        { containerName: string; containerType: string; vlName?: string }
    > = {};
    const voltageLevels: { vl: IdentifiedObject; bayIds: string[] }[] = [];
    const seenIds = new Set<string>();

    const addComponent = (
        comp: IdentifiedObject,
        container: string,
        containerType: string,
        vlName?: string
    ) => {
        if (seenIds.has(comp.mRID)) return;
        seenIds.add(comp.mRID);
        components.push(comp);
        containerInfo[comp.mRID] = { containerName: container, containerType, vlName };
    };

    // Load voltage levels
    const vlRefs: any[] = (substation as any).voltageLevels || [];
    for (const vlRef of vlRefs) {
        const vlId = vlRef.mRID || vlRef.rdfId;
        if (!vlId) continue;
        const vl = await getComponentById<IdentifiedObject>(vlId);
        if (!vl) continue;

        const bayIds: string[] = [];

        // Collect connectivity nodes from this voltage level
        const cnRefs: any[] = (vl as any).connectivityNodes || [];
        for (const cnRef of cnRefs) {
            const cnId = cnRef.mRID || cnRef.rdfId;
            if (!cnId) continue;
            const cn = await getComponentById<IdentifiedObject>(cnId);
            if (cn) {
                addComponent(cn, vl.name, "VoltageLevel", vl.name);
                internalCNIds.push(cn.mRID);
            }
        }

        // Load equipment directly in the voltage level
        const vlEqRefs: any[] = (vl as any).equipments || [];
        for (const eqRef of vlEqRefs) {
            const eqId = eqRef.mRID || eqRef.rdfId;
            if (!eqId) continue;
            const eq = await getComponentById<IdentifiedObject>(eqId);
            if (eq) {
                addComponent(eq, vl.name, "VoltageLevel", vl.name);
            }
        }

        // Load bays and their equipment
        const bayRefs: any[] = (vl as any).bays || [];
        for (const bayRef of bayRefs) {
            const bayId = bayRef.mRID || bayRef.rdfId;
            if (!bayId) continue;
            const bay = await getComponentById<IdentifiedObject>(bayId);
            if (!bay) continue;
            bayIds.push(bay.mRID);

            const bayEqRefs: any[] = (bay as any).equipments || [];
            for (const eqRef of bayEqRefs) {
                const eqId = eqRef.mRID || eqRef.rdfId;
                if (!eqId) continue;
                const eq = await getComponentById<IdentifiedObject>(eqId);
                if (eq) {
                    addComponent(eq, bay.name, "Bay", vl.name);
                }
            }
        }

        voltageLevels.push({ vl, bayIds });
    }

    // Load equipment directly in the substation (e.g., PowerTransformers)
    const subEqRefs: any[] = (substation as any).equipments || [];
    for (const eqRef of subEqRefs) {
        const eqId = eqRef.mRID || eqRef.rdfId;
        if (!eqId) continue;
        const eq = await getComponentById<IdentifiedObject>(eqId);
        if (eq) {
            addComponent(eq, substation.name, "Substation");
        }
    }

    return {
        substation,
        voltageLevels,
        components,
        internalCNIds,
        containerInfo,
    };
};
