import { getComponentById } from "@/lib/store/model-repository";
import {
    ACLineSegment,
    Breaker,
    ConnectivityNode,
    GeneratingUnit,
    Terminal,
    BusbarSection,
    NonConformLoad,
    PowerTransformer,
    PowerTransformerEnd,
    Bay,
    Substation,
    Line,
    ConformLoad,
    CIM,
    SynchronousMachine,
    Disconnector,
    LinearShuntCompensator,
    RatioTapChanger,
    RegulatingControl,
    CurrentLimit,
    VoltageLimit,
    OperationalLimitSet,
    GeographicalRegion,
    SubGeographicalRegion,
    VoltageLevel,
    ConformLoadGroup,
    ControlArea,
    LoadArea,
} from "@/lib/cim";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import GenericComponent from "@/components/equipment/generic-component";
import {
    largeComponentStyling,
    mediumComponentStyling,
    smallComponentStyling,
} from "@/components/dig/flow-component";
import {
    Circle,
    Factory,
    HousePlug,
    LandPlot,
    Shell,
    Square,
    SquareTerminal,
    Triangle,
} from "lucide-react";
import { ComponentIcon } from "@/components/component-icon";
import { cimPresentationMap, defaultCimPresentation } from "@/lib/cim-presentation";
import { Fragment } from "react";
import { componentDescriptionMap } from "@/lib/cim-presentation";
import { splitTitle } from "@/lib/utils";

export default async function Home() {
    const acLineSegmentId = "f1769cf8-9aeb-11e5-91da-b8763fd99c5f";
    const breakerId = "22e5ddcf-ac23-b449-bc4f-83336535f7c2";

    const acLineSegment = await getComponentById<ACLineSegment>(acLineSegmentId);
    const breaker = await getComponentById<Breaker>(breakerId);
    const generator = await getComponentById<GeneratingUnit>(
        "f1769915-9aeb-11e5-91da-b8763fd99c5f"
    );
    const cn = await getComponentById<ConnectivityNode>("f176969d-9aeb-11e5-91da-b8763fd99c5f");
    const terminal = await getComponentById<Terminal>("2dd903ab-bdfb-11e5-94fa-c8f73332c8f4");
    const busbarSection = await getComponentById<BusbarSection>(
        "2dd90172-bdfb-11e5-94fa-c8f73332c8f4"
    );
    const powerTransformer = await getComponentById<PowerTransformer>(
        "f1769da0-9aeb-11e5-91da-b8763fd99c5f"
    );
    const PowerTransformerEnd = await getComponentById<PowerTransformerEnd>(
        "2dd9044c-bdfb-11e5-94fa-c8f73332c8f4"
    );
    const loadProp = await getComponentById<NonConformLoad>("f17697f4-9aeb-11e5-91da-b8763fd99c5f");
    const Substation = await getComponentById<Substation>("f1769604-9aeb-11e5-91da-b8763fd99c5f");
    const Bay = await getComponentById<Bay>("f72994d8-9857-b349-a4ae-2e3c9652d5bc");
    const Line = await getComponentById<Line>("5e7d0b4c-fa65-1d40-aef6-779298018c7e");
    const ConformLoad = await getComponentById<ConformLoad>("f1769746-9aeb-11e5-91da-b8763fd99c5f");
    const synchronousMachine = await getComponentById<SynchronousMachine>(
        "f1769919-9aeb-11e5-91da-b8763fd99c5f"
    );
    const disconnector = await getComponentById<Disconnector>(
        "4e7aa43e-f1a3-0046-8cbb-19f29bfdeab6"
    );
    const linearShuntCompensator = await getComponentById<LinearShuntCompensator>(
        "2dd90408-bdfb-11e5-94fa-c8f73332c8f4"
    );
    const ratioTapChanger = await getComponentById<RatioTapChanger>(
        "f1769d98-9aeb-11e5-91da-b8763fd99c5f"
    );
    const regulatingControl = await getComponentById<RegulatingControl>(
        "f1769918-9aeb-11e5-91da-b8763fd99c5f"
    );
    const currentLimit = await getComponentById<CurrentLimit>(
        "0f6d2d4a-4998-478d-a90a-17edb799a0ae"
    );
    const voltageLimit = await getComponentById<VoltageLimit>(
        "f1769e57-9aeb-11e5-91da-b8763fd99c5f"
    );
    const operationalLimitSet = await getComponentById<OperationalLimitSet>(
        "f802a83f-b9fb-48fb-9dde-0f5132e5f886"
    );
    const geographicalRegion = await getComponentById<GeographicalRegion>(
        "2dd9048c-bdfb-11e5-94fa-c8f73332c8f4"
    );
    const subGeographicalRegion = await getComponentById<SubGeographicalRegion>(
        "f17696b3-9aeb-11e5-91da-b8763fd99c5f"
    );
    const voltageLevel = await getComponentById<VoltageLevel>(
        "f1769600-9aeb-11e5-91da-b8763fd99c5f"
    );
    const conformLoadGroup = await getComponentById<ConformLoadGroup>(
        "2dd901f8-bdfb-11e5-94fa-c8f73332c8f4"
    );
    const controlArea = await getComponentById<ControlArea>("f17696b0-9aeb-11e5-91da-b8763fd99c5f");
    const loadArea = await getComponentById<LoadArea>("2dd901b5-bdfb-11e5-94fa-c8f73332c8f4");
    const handleExpand = async () => {
        "use server";
    };

    function renderGeneric(equipment: CIM) {
        const presentation = cimPresentationMap[equipment.rdfType] ?? defaultCimPresentation;

        return (
            <div className="flex items-start w-full gap-10 ">
                <div className="w-1/4 flex justify-start pl-12">
                    <GenericComponent
                        data={{
                            equipment: equipment,
                            otherData: { color: undefined, expanded: false },
                        }}
                        states={{ handleExpand: handleExpand, collapsed: false }}
                        presentation={presentation}
                    />
                </div>
                <div className="w-3/4">
                    <span className="font-bold flex w-full gap-2">
                        {presentation.icon}
                        {splitTitle(equipment.rdfType)}
                    </span>
                    <p>{componentDescriptionMap.get(equipment.rdfType)}</p>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4 justify-between w-full">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">Gallery</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className="ml-auto"></div>
                    </div>
                </header>
                <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-left min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                    <main className="flex flex-col gap-12 row-start-2 justify-items-center ">
                        {acLineSegment && renderGeneric(acLineSegment)}

                        {breaker && renderGeneric(breaker)}
                        {generator && renderGeneric(generator)}
                        {cn && renderGeneric(cn)}
                        {terminal && renderGeneric(terminal)}
                        {busbarSection && renderGeneric(busbarSection)}
                        {powerTransformer && renderGeneric(powerTransformer)}
                        {PowerTransformerEnd && renderGeneric(PowerTransformerEnd)}
                        {loadProp && renderGeneric(loadProp)}
                        {Substation && renderGeneric(Substation)}
                        {Bay && renderGeneric(Bay)}
                        {Line && renderGeneric(Line)}
                        {ConformLoad && renderGeneric(ConformLoad)}
                        {synchronousMachine && renderGeneric(synchronousMachine)}
                        {disconnector && renderGeneric(disconnector)}
                        {linearShuntCompensator && renderGeneric(linearShuntCompensator)}
                        {ratioTapChanger && renderGeneric(ratioTapChanger)}
                        {regulatingControl && renderGeneric(regulatingControl)}
                        {currentLimit && renderGeneric(currentLimit)}
                        {voltageLimit && renderGeneric(voltageLimit)}
                        {operationalLimitSet && renderGeneric(operationalLimitSet)}
                        {geographicalRegion && renderGeneric(geographicalRegion)}
                        {subGeographicalRegion && renderGeneric(subGeographicalRegion)}
                        {voltageLevel && renderGeneric(voltageLevel)}
                        {conformLoadGroup && renderGeneric(conformLoadGroup)}
                        {controlArea && renderGeneric(controlArea)}
                        {loadArea && renderGeneric(loadArea)}
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
