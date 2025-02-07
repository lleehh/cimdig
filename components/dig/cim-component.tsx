'use client'
import {
    ACLineSegment,
    Breaker,
    CIM,
    ConnectivityNode,
    GeneratingUnit,
    NonConformLoad,
    Terminal,
    BusbarSection
} from "@/lib/cim";
import ACLineSegmentComponent from "@/components/equipment/aclinesegment-component";
import BreakerComponent from "@/components/equipment/breaker-component";
import ConnectivityNodeComponent from "@/components/equipment/connectivety-node-component";
import GenericComponent from "@/components/equipment/generic-component";
import TerminalComponent from "@/components/equipment/terminal-component";
import GeneratorComponent from "@/components/equipment/generator-component";
import NonConformLoadComponent from "../equipment/nonconformload-component";
import BusbarComponent from "../equipment/busbarsection-component";




export default function CimComponent({equipment}: { equipment: CIM }) {

    const renderComponent = () => {
        switch (equipment.rdfType) {
            case "cim:ACLineSegment":
                return <ACLineSegmentComponent equipment={equipment as ACLineSegment}/>;
            case "cim:Terminal":
                return <TerminalComponent equipment={equipment as Terminal}/>;
            case "cim:ConnectivityNode":
                return <ConnectivityNodeComponent equipment={equipment as ConnectivityNode}/>;
            case "cim:Breaker":
                return <BreakerComponent equipment={equipment as Breaker}/>;
            case "cim:GeneratingUnit":
                return <GeneratorComponent equipment={equipment as GeneratingUnit}/>;
            case "cim:NonConformLoad":
                return <NonConformLoadComponent equipment={equipment as NonConformLoad}/>;
            case "cim:BusbarSection":
                return <BusbarComponent equipment={equipment as BusbarSection}/>;
            default:
                return <GenericComponent equipment={equipment}/>;
        }
    };
    
    return (
    <>
        
        {renderComponent()}
    </>)
}