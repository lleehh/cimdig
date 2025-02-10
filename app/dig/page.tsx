import {getComponentById} from "@/lib/store/model-repository";
import {ACLineSegment, Breaker} from "@/lib/cim";
import CimComponent from "@/components/cim-component";
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
import Dig from "@/components/dig/flow";
import FlowRoot from "@/components/dig/flow_root";

export default async function Home() {


    const acLineSegmentId = "f1769cf8-9aeb-11e5-91da-b8763fd99c5f"
    const breakerId = "22e5ddcf-ac23-b449-bc4f-83336535f7c2"


    const acLineSegment = await getComponentById<ACLineSegment>(acLineSegmentId)
    const breaker = await getComponentById<Breaker>(breakerId)

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
                                        CimDig
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block"/>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className="ml-auto">
                        </div>
                    </div>
                </header>
                <FlowRoot>
                    <Dig equipment={acLineSegment}/>
                </FlowRoot>
            </SidebarInset>
        </SidebarProvider>
    );
}
