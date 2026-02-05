"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdditionalCimLinks from "@/components/additional-cim-links-component";
import { Button } from "@/components/ui/button";
import { Expand } from "lucide-react";
import DisplayProperty from "./display-property-component";
import { CIM } from "@/lib/cim";
import { componentParameters, componentRefs, isEquipmentExpandable } from "@/lib/services/cim-service";
import useFlowStore, { OtherData, selector } from "@/lib/store/store-flow";
import { useShallow } from "zustand/react/shallow";
import { componentStatus } from "@/lib/flow-utils";
import Description from "./description-component";

interface BtnGroupComponentProps {
    handleExpand: () => void
    equipment: CIM
    otherData: OtherData
}

type OpenThing = "description" | "properties" | "links" | null;

export default function BtnGroupComponent({equipment, otherData, handleExpand}: BtnGroupComponentProps) {
    // Avoid rendering this component on the gallery page.
    const pathname = usePathname();
    if (pathname === "/") {
        return null;
    }
    const refs = componentRefs(equipment)
    const propertyList = componentParameters(equipment)
    // These lines are referenced by related components to keep only one DropdownMenu open at a time.

    // Single source of truth: only one can be open
    const [openThing, setOpenThing] = useState<OpenThing>(null)

    const { nodes, edges } = useFlowStore(useShallow(selector))
    const expandable = isEquipmentExpandable(equipment)

    const onExpand = () => {
        setOpenThing(null)
        otherData.expanded = true
        handleExpand()
    }

    // Filters out components already loaded but not connected to any edges, or not yet loaded at all.
    const components = componentStatus(equipment, nodes, edges);
    const haveMoreRefs =
        components.filter(
            (status) =>
                (status.exists === true && status.connected === false) || status.exists === false
        ).length > 0;

    return (
        <div>
            <div className="w-max h-max rounded-t-xl border-r border-t border-l bg-card text-card-foreground absolute -top-4 right-0">
                {/* Properties: controlled */}
                <DisplayProperty
                    data={propertyList}
                    open={openThing === "properties"}
                    onOpenChange={(open) =>
                        setOpenThing((prev) =>
                            open ? "properties" : prev === "properties" ? null : prev
                        )
                    }
                />

                {/* Links: Popover-based + controlled */}
                {haveMoreRefs && (
                    <AdditionalCimLinks
                        component={equipment}
                        componentRefs={components}
                        open={openThing === "links"}
                        onOpenChange={(open) =>
                            setOpenThing((prev) =>
                                open ? "links" : prev === "links" ? null : prev
                            )
                        }
                    />
                )}

        {/* Properties: controlled */}
        <DisplayProperty
          data={propertyList}
          open={openThing === "properties"}
          onOpenChange={(open) =>
            setOpenThing((prev) => (open ? "properties" : prev === "properties" ? null : prev))
          }
        />

        {/* Links: Popover-based + controlled */}
        {haveMoreRefs && (
          <AdditionalCimLinks
            component={equipment}
            otherData={otherData}
            componentRefs={components}
            open={openThing === "links"}
            onOpenChange={(open) =>
              setOpenThing((prev) => (open ? "links" : prev === "links" ? null : prev))
            }
          />
        )}

        {expandable && (
          <Button variant="ghost" size="icon" onClick={onExpand} disabled={otherData.expanded}>
            <Expand />
          </Button>
        )}
      </div>
    </div>
  )
}

