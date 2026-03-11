import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CIM, Terminal } from "./cim";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const splitTitle = (raw) => raw.split(":")[1];

export function getTitle(equipment: CIM): string {
    const type = splitTitle(equipment.rdfType);

    switch (type) {
        case "Terminal": {
            const seq = (equipment as Terminal).sequenceNumber;
            return seq ? `T${seq}` : "T";
        }

        case "PowerTransformer":
            return "PT";

        case "PowerTransformerEnd":
            return "PTE";

        case "ConnectivityNode":
            return "CN";

        case "BusbarSection":
            return "Busbar";

        case "SynchronousMachine":
            return "SyncMach";

        case "LinearShuntCompensator":
            return "ShuntComp";

        case "RatioTapChanger":
            return "RTC";

        case "RegulatingControl":
            return "RegCtrl";

        case "CurrentLimit":
            return "CurLimit";

        case "VoltageLimit":
            return "VoltLimit";

        case "OperationalLimitSet":
            return "OpLimSet";

        case "GeographicalRegion":
            return "GeoRegion";

        case "SubGeographicalRegion":
            return "SubGeoReg";

        case "VoltageLevel":
            return "VoltLvl";

        case "ConformLoadGroup":
            return "CLGroup";

        case "ControlArea":
            return "CtrlArea";

        default:
            return type;
    }
}
