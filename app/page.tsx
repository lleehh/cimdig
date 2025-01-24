import {getComponentById} from "@/services/model-repository";
import {ACLineSegment} from "@/models/cim";

export default async function Home() {


    const rdfId = "_f1769cf8-9aeb-11e5-91da-b8763fd99c5f"


    const acLineSegment = await getComponentById<ACLineSegment>(rdfId)


    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
            </main>
        </div>
    );
}
