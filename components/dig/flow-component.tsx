'use client'
import CimComponent from "@/components/dig/cim-component";
import {
    ACLineSegment,
    CIM,
    ConnectivityNode,
    EquipmentContainer,
    IdentifiedObject,
    isConductingEquipment,
    isConnectivityNode,
    isTerminal, PowerTransformerEnd,
    Substation,
    Terminal,
    VoltageLevel
} from "@/lib/cim";
import {createEdge, createNode, doesEquipmentExistsInFlow} from "@/lib/flow-utils";
import {findById, getComponentById} from "@/lib/store/model-repository";
import useFlowStore, {CimNode, selector} from "@/lib/store/store-flow";
import {Edge, Handle, NodeProps, Position, useStore,} from "@xyflow/react";
import {useEffect, useState} from "react";
import {useShallow} from "zustand/react/shallow";

const zoomSelector = (s: { transform: number[]; }) => s.transform[2] >= 0.6;

export function CollapsedStyling() {
    return (
        "w-44 border border-gray-400 p-3 bg-white"
    )
}

export function colorStyling(color: string) {
    return (
        <div style={{backgroundColor: color ?? "black", height: "10px"}}> </div>
    )
}

export function smallComponentStyling() {
    return (
        "w-[135px]"
    )
}

export function mediumComponentStyling() {
    return (
       "w-[180px]"
    ) 
}

export function largeComponentStyling() {
    return "w-[270px]";
}




export default function FlowComponent({data}: NodeProps<CimNode>) {
    // The fully loaded component from the database
    const [component, setComponent] = useState<CIM | null>(null);
    const showContent = useStore(zoomSelector);

    const createComponentData = (componentData: IdentifiedObject | null) => {
        if(componentData) {
            if (checkNodesForConnections(nodes, componentData).newNodesInfo.length == 0) {data.otherData.expanded = true}
        }
        setComponent(componentData);
    };

    const {
        nodes,
        edges,
        setNodes,
        setEdges,
        setFocusNode
    } = useFlowStore(useShallow(selector),);

    useEffect(() => {
        if (!component) {
            const loadComponent = async () => {
                let comp = await getComponentById(data.cimData.rdfId)
                if (comp != null) {
                    findClosestSubstation(comp)
                }
                
                setComponent(comp)
            }
            loadComponent()

        }
        
    }, []);

    async function checkSaveAndContinue(component, fullSubstation) {
        if (!fullSubstation.some(x => x.mRID === component.mRID)) {
            fullSubstation.push(component)
            await compFinder(component, fullSubstation)
            console.log(fullSubstation)
        }
    }

    async function compFinder(component: IdentifiedObject, fullSubstation) {
        // console.log("finding components under: ")
        switch (component["rdfType"]) {
            case "cim:Substation":
                fullSubstation.push(component["cim:IdentifiedObject.name"])
                for (const e of component["cim:EquipmentContainer.Equipments"] ?? []) {
                    let substationEquipment = await findById(e["mRID"])
                    checkSaveAndContinue(substationEquipment, fullSubstation)
                }
            case "cim:PowerTransformer":
                for (const e of component["cim:ConductingEquipment.Terminals"] ?? []) {
                    let terminal = await findById(e["mRID"])
                    checkSaveAndContinue(terminal, fullSubstation)
                }
            case "cim:Terminal":
                const mRID = component["cim:Terminal.ConnectivityNode"]?.mRID;
                if (mRID) {
                    const connectivityNode = await findById(mRID);
                    checkSaveAndContinue(connectivityNode, fullSubstation)
                }
            case "cim:ConnectivityNode":
                for (const e of component["cim:ConnectivityNode.Terminals"] ?? []) {
                    let terminal = await findById(e["mRID"])
                    checkSaveAndContinue(terminal, fullSubstation)
                }
            default:
                break;
        }
    }
    
    async function findClosestSubstation(component: CIM) {


        switch (component.rdfType) {
            case "cim:ACLineSegment":
                let acLineSegment: ACLineSegment | null = await getComponentById(component.rdfId)
                if (acLineSegment != null) {
                    for (const e of acLineSegment.terminals) {
                        let terminal: Terminal | null = await getComponentById(e.mRID)
                        if (terminal != null) {
                            findClosestSubstation(terminal)
                        }
                    }
                }
                break;
            case "cim:Terminal":
                let terminal: Terminal | null = await getComponentById(component.rdfId)
                let fullSubstation: object[] = []
                if (terminal != null) {
                    const cn: ConnectivityNode | null = await getComponentById(terminal.connectivityNode.mRID)
                    if (cn != null) {
                        const cnContainer: EquipmentContainer | null = await getComponentById(cn.connectivityNodeContainer.mRID)
                        if (cnContainer != null) {                            
                            const voltageLevel: VoltageLevel | null = await getComponentById(cnContainer?.mRID)
                            if (voltageLevel != null) {
                                const subStation: Substation | null = await getComponentById(voltageLevel.substation.mRID)
                                if (subStation != null) {
                                    let subStationMrid = subStation.mRID
                                    let stationName = subStation.name
                                    
                                    compFinder(subStation, fullSubstation)
                                    console.log("Closest substation is: " + stationName + subStationMrid)
                                }
                            }
                        }
                    }
                }
            default:
                break;
        }
    }
    




    const handleExpand = async () => {
        console.log("Nodes:", nodes)

        // We need to load the full component from the database to get all the properties

        const node = nodes.find(node => node.id === component?.rdfId)
        const edge = edges.filter(edge => edge.source === component?.rdfId || edge.target === component?.rdfId)

        /*
            We have a set of different types that we will automatically render:
            terminals, connectivity nodes
         */

        let colors: string[] = [
            "#ff9e9e",
            "#9eadff",
            "#ea9eff",
            "#c8ff9e",
            "#ffe380",
            "#9effdd",
        ]


        if (node && component) {
            const {newNodes, newEdges} = createConnectingNodes(nodes, component)

            if (newNodes.length > 0) {
                newNodes[0].data.otherData.color = data.otherData.color
                if (newNodes.length > 1) {
                    newNodes.forEach((element, i) => {
                        element.data.otherData.color = colors[i % colors.length]
                    });
                }
                
                setNodes([...nodes, ...newNodes])
                setEdges([...edges, ...newEdges])
                setFocusNode(newNodes[newNodes.length - 1].id)
            }
        }
        // Will disable expand button in btn-group-component if all nodes connected to current CIM component already exists in flow.
        data.otherData.expanded = true
    }


    return (
        <div>

            <Handle type="target" isConnectable={false} position={Position.Left}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400"/>
            <Handle type="target" isConnectable={false} position={Position.Left}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="bottomHandle"/>
            <div>
                <CimComponent equipment={component || data.cimData} otherData={data.otherData} collapsed={!showContent} handleExpand={handleExpand}/>
            </div>
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !rounded-none !bg-stone-400" id=""/>
            <Handle type="source" isConnectable={false} position={Position.Right}
                    className="!w-3 !h-3 !rounded-none !bg-stone-400" id="topHandle"/>
        </div>
    )
}

