"use client";
import { memo } from "react";
import { Handle, NodeProps, Position, type Node } from "@xyflow/react";

export interface SubstationGroupData {
    label: string;
    substationName: string;
    groupType: "substation" | "voltageLevel";
    [key: string]: unknown;
}

export type SubstationGroupNodeType = Node<SubstationGroupData, "substationGroup">;

const groupStyles: Record<string, { bg: string; border: string; labelBg: string }> = {
    substation: {
        bg: "rgba(59, 130, 246, 0.06)",
        border: "2px dashed rgba(59, 130, 246, 0.4)",
        labelBg: "rgba(59, 130, 246, 0.12)",
    },
    voltageLevel: {
        bg: "rgba(16, 185, 129, 0.05)",
        border: "1.5px dashed rgba(16, 185, 129, 0.35)",
        labelBg: "rgba(16, 185, 129, 0.1)",
    },
};

function SubstationGroupNode({ data }: NodeProps<SubstationGroupNodeType>) {
    const style = groupStyles[data.groupType] || groupStyles.substation;

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: style.bg,
                border: style.border,
                borderRadius: "12px",
                position: "relative",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: "8px",
                    left: "12px",
                    backgroundColor: style.labelBg,
                    borderRadius: "6px",
                    padding: "4px 12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: data.groupType === "substation" ? "#2563eb" : "#059669",
                    letterSpacing: "0.02em",
                    userSelect: "none",
                    pointerEvents: "none",
                }}
            >
                {data.groupType === "substation" ? "Substation" : "VL"}: {data.label}
            </div>
            {/* Handles are needed so edges can connect to the group if needed */}
            <Handle type="target" position={Position.Left} style={{ visibility: "hidden" }} />
            <Handle type="source" position={Position.Right} style={{ visibility: "hidden" }} />
        </div>
    );
}

export default memo(SubstationGroupNode);
