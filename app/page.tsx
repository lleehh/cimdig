import {getComponentById} from "@/services/model-repository";
import {ACLineSegment, Breaker, ConnectivityNode, GeneratingUnit, Terminal} from "@/models/cim";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {Separator} from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import BreakerComponent from "@/components/equipment/breaker-component";
import GeneratorComponent from "@/components/equipment/generator-component";
import ACLineSegmentComponent from "@/components/equipment/aclinesegment-component";
import ConnectivityNodeComponent from "@/components/equipment/connectivety-node-component";
import TerminalComponent from "@/components/equipment/terminal-component";

export default async function Home() {

    const acLineSegmentId = "f1769cf8-9aeb-11e5-91da-b8763fd99c5f"
    const breakerId = "22e5ddcf-ac23-b449-bc4f-83336535f7c2"


    const acLineSegment = await getComponentById<ACLineSegment>(acLineSegmentId)
    const breaker = await getComponentById<Breaker>(breakerId)
    const generator = await getComponentById<GeneratingUnit>("f1769915-9aeb-11e5-91da-b8763fd99c5f")
    const cn = await getComponentById<ConnectivityNode>("f176969d-9aeb-11e5-91da-b8763fd99c5f")
    const terminal = await getComponentById<Terminal>("2dd903ab-bdfb-11e5-94fa-c8f73332c8f4")

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header
                    className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4 justify-between w-full">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator orientation="vertical" className="mr-2 h-4"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Gallery
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block"/>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className="ml-auto">
                        </div>
                    </div>
                </header>
                <div
                    className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                        {acLineSegment && <ACLineSegmentComponent equipment={acLineSegment}/>}
                        {breaker && <BreakerComponent  equipment={breaker}/>}
                        {generator && <GeneratorComponent equipment={generator}/>}
                        {cn && <ConnectivityNodeComponent equipment={cn}/>}
                        {terminal && <TerminalComponent equipment={terminal}/>}
                    </main>
                </div>
            </SidebarInset>

        </SidebarProvider>
    );
}
