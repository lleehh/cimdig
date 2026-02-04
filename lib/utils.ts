import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CIM, Terminal } from "./cim";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTitle(equipment: CIM): string {
  const type = equipment.rdfType.split(":")[1];

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

    default:
      return type;
  }
}
