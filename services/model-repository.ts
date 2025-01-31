'use server'
import path from "path";
import fs from "fs/promises";
import {convertToCimObject, isConductingEquipment} from "@/services/transform-cim-service";
import {BaseVoltage, CIM, IdentifiedObject} from "@/models/cim";

export type JsonData = Record<string, string>;
export type SearchResult = { name: string, id: string }[];

const dataDir = path.join(process.cwd(), "models", "nordic44");

let byIdData: JsonData | null = null
let byNameData: JsonData | null = null

const readJsonFile = async (filename: string): Promise<JsonData> => {
    const filePath = path.join(dataDir, filename);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
};

export const findById = async (id: string): Promise<JsonData | null> => {
    if (byIdData === null) {
        byIdData = await readJsonFile("nordic44_cgm_37a_eq_by_id.json");
    }
    return typeof byIdData[id] === "object" && byIdData[id] !== null ? (byIdData[id] as JsonData) : null;
}

export const findByName = async (name: string): Promise<JsonData | null> => {
    if (byNameData === null) {
        byNameData = await readJsonFile("nordic44_cgm_37a_eq_by_name.json");
    }
    return typeof byNameData[name] === "object" && byNameData[name] !== null ? (byNameData[name] as JsonData) : null;
}

export const searchByName = async (query: string): Promise<SearchResult> => {
    if (byNameData === null) {
        byNameData = await readJsonFile("nordic44_cgm_37a_eq_by_name.json");
    }
    const result: SearchResult = []
    for (const key in byNameData) {
        if (key.toLowerCase().startsWith(query.toLowerCase())) {
            const data = byNameData[key]
            const mRID = data["mRID"]
            if (mRID)
                result.push({name: key, id: mRID as string})
        }
    }
    return result
}

export const getComponentById = async <T extends IdentifiedObject>(rdfId: string, dontEnrich?: boolean): Promise<T | null> => {
    const data = await findById(rdfId);
    if (data == null) {
        return null;
    } else {
        const obj = convertToCimObject<T>(rdfId, data);
        if (dontEnrich)
            return obj;
        else
            return enrichComponent(obj);
    }
}


async function enrichComponent<T extends IdentifiedObject>(component: T): Promise<T> {
    if (isConductingEquipment(component) && component.baseVoltage?.id) {
        const baseVoltage = await getComponentById<BaseVoltage>(component.baseVoltage.id as string, true);
        if (baseVoltage) {
            component.baseVoltage = baseVoltage;
        }
    }
    return component;
}
