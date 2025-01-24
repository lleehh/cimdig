import {NextResponse} from "next/server";
import {findById, findByName, findByType} from "@/services/model-repository";

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
