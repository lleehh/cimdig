import path from "path";
import fs from "fs/promises";
import {NextResponse} from "next/server";

type JsonData = Record<string, unknown>;

const dataDir = path.join(process.cwd(), "app", "api", "data");

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

// API handler
export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    const name = searchParams.get("name");

    try {
        if (id) {
            const result = await findById(id);
            return NextResponse.json(result);
        } else if (type) {
            const result = await findByType(type);
            return NextResponse.json(result);
        } else if (name) {
            const result = await findByName(name);
            return NextResponse.json(result);
        } else {
            return new Response(
                JSON.stringify({error: "Please specify id, type, or name in query parameters"}),
                {status: 400, headers: {"Content-Type": "application/json"}}
            );
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? "Internal Server Error - " + error.message : "Internal Server Error";
        return new Response(
            JSON.stringify({error: message}),
            {status: 500, headers: {"Content-Type": "application/json"}}
        );
    }
}
