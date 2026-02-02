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
    Substation, PowerTransformer, PowerTransformerEnd,
    Line,
    ConformLoad
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
import LineComponent from "../equipment/line-component";
import ConformLoadComponent from "../equipment/conformload-component";
import { OtherData } from "@/lib/store/store-flow";


interface CimComponentProps {
    equipment: CIM
    otherData: OtherData
    collapsed?: boolean
    handleExpand: () => void 
}

export default function CimComponent({equipment, otherData, collapsed, handleExpand}: CimComponentProps) {

    const renderComponent = () => {
        switch (equipment.rdfType) {
            case "cim:ACLineSegment":
                return <ACLineSegmentComponent equipment={equipment as ACLineSegment} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
            case "cim:Terminal":
                return <TerminalComponent equipment={equipment as Terminal} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
            case "cim:ConnectivityNode":
                return <ConnectivityNodeComponent equipment={equipment as ConnectivityNode} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
            case "cim:Breaker":
                return <BreakerComponent equipment={equipment as Breaker} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
            case "cim:GeneratingUnit":
                return <GeneratorComponent equipment={equipment as GeneratingUnit} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
            case "cim:NonConformLoad":
                return <NonConformLoadComponent equipment={equipment as NonConformLoad} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
            case "cim:BusbarSection":
                return <BusbarComponent equipment={equipment as BusbarSection} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
            case "cim:Bay":
                return <Baycomponent equipment={equipment as Bay} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
            case "cim:Substation":
                return <Substationcomponent equipment={equipment as Substation} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
            case "cim:PowerTransformer":
                return <PowerTransformerComponent equipment={equipment as PowerTransformer} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
            case "cim:PowerTransformerEnd":
                return <PowerTransformerEndComponent equipment={equipment as PowerTransformerEnd} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
            case "cim:Line":
                return <LineComponent equipment={equipment as Line} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>
            case "cim:ConformLoad":
                return <ConformLoadComponent equipment={equipment as ConformLoad} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>
            default:
                return <GenericComponent equipment={equipment} otherData={otherData} collapsed={collapsed} handleExpand={handleExpand}/>;
        }
    };
    
    return (
    <>
        
        {renderComponent()}
    </>)
} 