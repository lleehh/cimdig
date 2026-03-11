"use server";
import path from "path";
import fs from "fs/promises";
import { convertToCimObject } from "@/lib/services/transform-cim-service";
import { CIM, IdentifiedObject } from "@/lib/cim";

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
 * Represents an outgoing line (e.g. ACLineSegment) that leaves the substation,
 * along with the terminal/CN it connects through and its destination info.
 */
export interface OutgoingLine {
    /** The conducting equipment that leaves the substation (e.g. ACLineSegment) */
    line: CIM;
    /** The terminal on the line that connects to the internal CN */
    lineTerminal: CIM;
    /** The mRID of the internal connectivity node the line connects to */
    internalCNId: string;
    /** Name of the destination substation (if traceable), or undefined */
    destinationSubstationName?: string;
    /** mRID of the VL the internal CN belongs to (for color/grouping) */
    vlId?: string;
}

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
    /** Maps voltage level mRID -> list of component mRIDs belonging to that VL */
    vlMembership: Record<string, string[]>;
    /** Outgoing lines (ACLineSegments etc.) that leave the substation */
    outgoingLines: OutgoingLine[];
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
    const vlMembership: Record<string, string[]> = {};
    const seenIds = new Set<string>();

    const addComponent = (
        comp: IdentifiedObject,
        container: string,
        containerType: string,
        vlName?: string,
        vlId?: string
    ) => {
        if (seenIds.has(comp.mRID)) return;
        seenIds.add(comp.mRID);
        components.push(comp);
        containerInfo[comp.mRID] = { containerName: container, containerType, vlName };
        if (vlId) {
            if (!vlMembership[vlId]) vlMembership[vlId] = [];
            vlMembership[vlId].push(comp.mRID);
        }
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
                addComponent(cn, vl.name, "VoltageLevel", vl.name, vlId);
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
                addComponent(eq, vl.name, "VoltageLevel", vl.name, vlId);
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
                    addComponent(eq, bay.name, "Bay", vl.name, vlId);
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

    // Discover outgoing lines by examining each internal CN's terminal list.
    // Internal CNs may have terminals belonging to external equipment (e.g. ACLineSegments
    // contained in cim:Line, not in this substation). We load each such piece of
    // equipment and, when possible, trace the other end to find the destination substation.
    const outgoingLines: OutgoingLine[] = [];
    const internalEquipmentIds = new Set(
        components
            .filter(
                (c) =>
                    (c as any).rdfType !== "cim:ConnectivityNode" &&
                    (c as any).rdfType !== "cim:Terminal"
            )
            .map((c) => c.mRID)
    );
    // Also track the CN mRID -> vlId for outgoing lines
    const cnToVlId: Record<string, string> = {};
    for (const [vlId, mridList] of Object.entries(vlMembership)) {
        for (const mrid of mridList) {
            if (internalCNIds.includes(mrid)) {
                cnToVlId[mrid] = vlId;
            }
        }
    }

    const seenLineIds = new Set<string>();
    for (const cnMRID of internalCNIds) {
        // Load the CN fully to get its terminal list
        const fullCN = await getComponentById<IdentifiedObject>(cnMRID);
        if (!fullCN) continue;

        const cnTerminals: any[] = (fullCN as any).terminals || [];
        for (const termRef of cnTerminals) {
            const termId = termRef.mRID || termRef.rdfId;
            if (!termId) continue;

            // Load the terminal fully to get its conductingEquipment
            const fullTerm = await getComponentById<IdentifiedObject>(termId);
            if (!fullTerm) continue;

            const eqRef = (fullTerm as any).conductingEquipment;
            if (!eqRef) continue;
            const eqMRID = eqRef.mRID || eqRef.rdfId;
            if (!eqMRID) continue;

            // Skip if this equipment is already internal
            if (internalEquipmentIds.has(eqMRID)) continue;
            // Skip duplicates (same line may appear via multiple CNs)
            if (seenLineIds.has(eqMRID)) continue;
            seenLineIds.add(eqMRID);

            // Load the external equipment (the outgoing line)
            const lineEquipment = await getComponentById<IdentifiedObject>(eqMRID);
            if (!lineEquipment) continue;

            // Try to trace the destination substation via the line's other terminal
            let destinationSubstationName: string | undefined;
            const lineTerminals: any[] = (lineEquipment as any).terminals || [];
            for (const ltRef of lineTerminals) {
                const ltId = ltRef.mRID || ltRef.rdfId;
                if (!ltId || ltId === termId) continue; // skip the terminal we came from

                const otherTerm = await getComponentById<IdentifiedObject>(ltId);
                if (!otherTerm) continue;

                const otherCNRef = (otherTerm as any).connectivityNode;
                if (!otherCNRef) continue;
                const otherCNId = otherCNRef.mRID || otherCNRef.rdfId;
                if (!otherCNId) continue;

                const otherCN = await getComponentById<IdentifiedObject>(otherCNId);
                if (!otherCN) continue;

                // The CN's container is a VoltageLevel, which has a substation reference
                const cnContainer = (otherCN as any).connectivityNodeContainer;
                if (!cnContainer) continue;
                const containerId = cnContainer.mRID || cnContainer.rdfId;
                if (!containerId) continue;

                const container = await getComponentById<IdentifiedObject>(containerId);
                if (!container) continue;

                // If the container is a VoltageLevel, it has a substation property
                const subRef = (container as any).substation;
                if (subRef) {
                    const subId = subRef.mRID || subRef.rdfId;
                    if (subId) {
                        const destSub = await getComponentById<IdentifiedObject>(subId);
                        if (destSub) {
                            destinationSubstationName = destSub.name;
                        }
                    }
                }
                break; // only need the first "other" terminal
            }

            outgoingLines.push({
                line: lineEquipment as CIM,
                lineTerminal: fullTerm as CIM,
                internalCNId: cnMRID,
                destinationSubstationName,
                vlId: cnToVlId[cnMRID],
            });
        }
    }

    return {
        substation,
        voltageLevels,
        components,
        internalCNIds,
        containerInfo,
        vlMembership,
        outgoingLines,
    };
};
