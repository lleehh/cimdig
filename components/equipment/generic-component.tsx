"use client";
import { CIM } from "@/lib/cim";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideProps, Triangle } from "lucide-react";
import { CollapsedStyling } from "../dig/flow-component";
import BtnGroupComponent from "../btn-group-component";
import { colorStyling } from "../dig/flow-component";
import {
  Component,
  ForwardRefExoticComponent,
  ReactElement,
  RefAttributes,
} from "react";

interface ConnectivetyNodeProps {
  equipment: CIM;
  collapsed?: boolean;
  handleExpand: () => void;
  size: () => string;
  icon: ReactElement;
}

export default function GenericComponent({
  equipment,
  collapsed,
  handleExpand,
  size,
  icon,
}: ConnectivetyNodeProps) {
  if (collapsed)
    return (
      <>
        {colorStyling(equipment)}
        <div className={`${CollapsedStyling()} flex items-center`}>
          <Triangle className="w-10 h-10" />
          <div className="overflow-hidden text-m ml-2">
            {equipment.name as string}
          </div>
        </div>
      </>
    );

  return (
    <div>
      <BtnGroupComponent equipment={equipment} handleExpand={handleExpand} />
      <Card className={size()} color={equipment.color?.toString()!}>
        <CardHeader>
          <CardTitle className="flex justify-between">
            <div className="flex flex-row items-center gap-2">
              {icon}
              <div
                className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                title={equipment.rdfType as string}
              >
                {equipment.rdfType}
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            <>
              {equipment.name && (
                <div
                  className="w-40 truncate overflow-hidden text-ellipsis text-xs text-gray-400"
                  title={equipment.name as string}
                >
                  {equipment.name as string}
                </div>
              )}
            </>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
