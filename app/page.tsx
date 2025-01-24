import {getComponentById} from "@/services/model-repository";
import {ACLineSegment, Breaker} from "@/models/cim";
import CimComponent from "@/components/cim-component";

export default async function Home() {


    const acLineSegmentId = "_f1769cf8-9aeb-11e5-91da-b8763fd99c5f"
    const breakerId = "_22e5ddcf-ac23-b449-bc4f-83336535f7c2"


    const acLineSegment = await getComponentById<ACLineSegment>(acLineSegmentId)
    const breaker = await getComponentById<Breaker>(breakerId)


    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                {acLineSegment && <CimComponent equipment={acLineSegment}/>}
                {breaker && <CimComponent equipment={breaker}/>}
            </main>
        </div>
    );
}
