'use server'
import path from "path";
import fs from "fs/promises";
import {convertToCimObject} from "@/lib/services/transform-cim-service";
import {IdentifiedObject} from "@/lib/cim";

export type JsonData = Record<string, string>;
export type SearchResult = { name: string, id: string, rdfType: string }[];

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
            const rdfType = data["rdfType"]
            if (mRID)
                result.push({
                    name: key,
                    id: mRID,
                    rdfType: rdfType as string
                })
        }
    }
    return result
}

export const getComponentById = async <T extends IdentifiedObject>(rdfId: string): Promise<T | null> => {
    const data = await findById(rdfId);
    if (data == null) {
        return null;
    } else {
        return convertToCimObject<T>(rdfId, data);
    }
}
