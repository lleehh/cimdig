'use client'
import {
    ACLineSegment,
    Breaker,
    CIM,
    ConnectivityNode,
    GeneratingUnit,
    NonConformLoad,
    Terminal,
    BusbarSection,
    Bay,
    Substation, PowerTransformer, PowerTransformerEnd
} from "@/lib/cim";
import ACLineSegmentComponent from "@/components/equipment/aclinesegment-component";
import BreakerComponent from "@/components/equipment/breaker-component";
import ConnectivityNodeComponent from "@/components/equipment/connectivety-node-component";
import GenericComponent from "@/components/equipment/generic-component";
import TerminalComponent from "@/components/equipment/terminal-component";
import GeneratorComponent from "@/components/equipment/generator-component";
import NonConformLoadComponent from "../equipment/nonconformload-component";
import BusbarComponent from "../equipment/busbarsection-component";
import Baycomponent from "../equipment/bay-component";
import Substationcomponent from "../equipment/substation-component";
import PowerTransformerComponent from "@/components/equipment/powertransformer-component";
import PowerTransformerEndComponent from "@/components/equipment/powertransformer-end-component";


export default function CimComponent({equipment, collapsed}: { equipment: CIM, collapsed?: boolean }) {

    const renderComponent = () => {
        switch (equipment.rdfType) {
            case "cim:ACLineSegment":
                return <ACLineSegmentComponent equipment={equipment as ACLineSegment} collapsed={collapsed}/>;
            case "cim:Terminal":
                return <TerminalComponent equipment={equipment as Terminal} collapsed={collapsed}/>;
            case "cim:ConnectivityNode":
                return <ConnectivityNodeComponent equipment={equipment as ConnectivityNode} collapsed={collapsed}/>;
            case "cim:Breaker":
                return <BreakerComponent equipment={equipment as Breaker} collapsed={collapsed}/>;
            case "cim:GeneratingUnit":
                return <GeneratorComponent equipment={equipment as GeneratingUnit} collapsed={collapsed}/>;
            case "cim:NonConformLoad":
                return <NonConformLoadComponent equipment={equipment as NonConformLoad} collapsed={collapsed}/>;
            case "cim:BusbarSection":
                return <BusbarComponent equipment={equipment as BusbarSection} collapsed={collapsed}/>;
            case "cim:Bay":
                return <Baycomponent equipment={equipment as Bay} collapsed={collapsed}/>;
            case "cim:Substation":
                return <Substationcomponent equipment={equipment as Substation} collapsed={collapsed}/>;
            case "cim:PowerTransformer":
                return <PowerTransformerComponent equipment={equipment as PowerTransformer} collapsed={collapsed}/>;
            case "cim:PowerTransformerEnd":
                return <PowerTransformerEndComponent equipment={equipment as PowerTransformerEnd} collapsed={collapsed}/>;
            default:
                return <GenericComponent equipment={equipment} collapsed={collapsed}/>;
        }
    };
    
    return (
    <>
        
        {renderComponent()}
    </>)
} 