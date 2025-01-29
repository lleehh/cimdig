'use server'
import path from "path";
import fs from "fs/promises";
import {convertToCimObject, isConductingEquipment} from "@/services/transform-cim-service";
import {BaseVoltage, IdentifiedObject} from "@/models/cim";

export type JsonData = Record<string, string>;
const dataDir = path.join(process.cwd(), "models", "nordic44");


const readJsonFile = async (filename: string): Promise<JsonData> => {
    const filePath = path.join(dataDir, filename);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
};

export const findById = async (id: string): Promise<JsonData | null> => {
    const data = await readJsonFile("nordic44_cgm_37a_eq_by_id.json");
    return typeof data[id] === "object" && data[id] !== null ? (data[id] as JsonData) : null;
};

export const findByType = async (type: string): Promise<JsonData[]> => {
    const data = await readJsonFile("nordic44_cgm_37a_eq_by_type.json");
    return Array.isArray(data[type]) ? (data[type] as JsonData[]) : [];
};

export const findByName = async (name: string): Promise<JsonData | null> => {
    const data = await readJsonFile("nordic44_cgm_37a_eq_by_name.json");
    return typeof data[name] === "object" && data[name] !== null ? (data[name] as JsonData) : null;
};


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
