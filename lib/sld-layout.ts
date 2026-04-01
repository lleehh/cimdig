/**
 * Single-Line Diagram (SLD) Layout Engine
 *
 * Arranges substation equipment in a traditional single-line diagram style:
 * - Horizontal busbars at the top of each voltage level
 * - Vertical bays hanging down from the busbars
 * - Equipment within each bay ordered top-to-bottom following connectivity
 *
 * Two modes:
 *   showTerminals=true  → Terminals are visible nodes between equipment and CNs
 *   showTerminals=false → Terminals are collapsed; equipment connects directly
 *                         to CNs / busbars. Layout is more compact.
 *
 * In both modes, busbar ConnectivityNodes are fully removed from the graph.
 * Edges that referenced a busbar CN are remapped to the busbar node itself,
 * making the busbar card the visual hub.
 *
 * KEY DESIGN: The CIM graph has Terminal nodes between every Equipment and
 * ConnectivityNode: Equipment ← Terminal → CN. This layout builds a "logical
 * adjacency" that skips Terminal nodes so we can reason about equipment-to-CN
 * connections directly.
 */

import { CimNode } from "@/lib/store/store-flow";
import { Edge } from "@xyflow/react";
import { CIM, IdentifiedObject } from "@/lib/cim";
import type { SubstationComponents } from "@/lib/store/model-repository";
import { edgeTemplate } from "@/lib/flow-utils";

// ── Layout constants ──────────────────────────────────────────────────
const NODE_WIDTH = 180;
const NODE_HEIGHT = 40;
const BUSBAR_HEIGHT = 24;
const BUSBAR_MIN_WIDTH = 400;
const BUSBAR_Y_SPACING = 60; // vertical gap between multiple busbars
const BAY_SPACING_X = 220; // horizontal gap between bay columns
const EQUIPMENT_SPACING_Y = 70; // vertical gap between equipment in a bay (no terminals)
const EQUIPMENT_SPACING_Y_WITH_TERMINALS = 90; // vertical gap when terminals are shown
const TERMINAL_OFFSET_Y = 40; // terminal placed this far below its equipment
const BAY_TOP_MARGIN = 50; // gap between lowest busbar and first bay equipment
const VL_PADDING = 40;
const VL_LABEL_HEIGHT = 30;
const VL_SPACING_Y = 60; // vertical gap between voltage level groups
const GROUP_PADDING = 60;
const LABEL_HEIGHT = 40;

// ── Equipment classification ──────────────────────────────────────────

function isBusbar(rdfType: string): boolean {
    return rdfType === "cim:BusbarSection";
}

function isConnectivityNode(rdfType: string): boolean {
    return rdfType === "cim:ConnectivityNode";
}

function isTerminal(rdfType: string): boolean {
    return rdfType === "cim:Terminal";
}

/**
 * Priority for ordering equipment within a vertical bay.
 * Lower number = closer to the busbar (top of bay).
 */
function equipmentSortPriority(rdfType: string): number {
    switch (rdfType) {
        case "cim:Disconnector":
            return 1;
        case "cim:Breaker":
            return 2;
        case "cim:PowerTransformer":
            return 5;
        case "cim:PowerTransformerEnd":
            return 6;
        case "cim:ACLineSegment":
            return 7;
        case "cim:SynchronousMachine":
            return 7;
        case "cim:GeneratingUnit":
            return 8;
        case "cim:ConformLoad":
            return 7;
        case "cim:NonConformLoad":
            return 7;
        case "cim:LinearShuntCompensator":
            return 7;
        default:
            return 4;
    }
}

// ── Graph pre-processing ──────────────────────────────────────────────

/**
 * Identifies busbar CNs (ConnectivityNodes directly connected to a BusbarSection
 * via a terminal chain) and returns a map from busbarCN id → busbar node id.
 *
 * The CIM pattern is:  BusbarSection ← Terminal → CN
 * We walk: for each busbar, find terminals adjacent to it, then find the CN
 * on the other side of those terminals.
 */
function findBusbarCNs(
    nodes: CimNode[],
    edges: Edge[]
): { busbarCNtoBusbar: Record<string, string>; busbarCNIds: Set<string> } {
    const nodeMap: Record<string, CimNode> = {};
    for (const n of nodes) nodeMap[n.id] = n;

    const adj: Record<string, Set<string>> = {};
    for (const e of edges) {
        if (!adj[e.source]) adj[e.source] = new Set();
        if (!adj[e.target]) adj[e.target] = new Set();
        adj[e.source].add(e.target);
        adj[e.target].add(e.source);
    }

    const terminalIds = new Set<string>();
    const busbarIds: string[] = [];
    for (const n of nodes) {
        const rt = n.data?.cimData?.rdfType ?? "";
        if (isTerminal(rt)) terminalIds.add(n.id);
        if (isBusbar(rt)) busbarIds.push(n.id);
    }

    const busbarCNtoBusbar: Record<string, string> = {};

    for (const busId of busbarIds) {
        const neighbors = adj[busId] ?? new Set();
        for (const mid of neighbors) {
            if (!terminalIds.has(mid)) continue;
            // mid is a terminal adjacent to the busbar — look for CN on far side
            const farNeighbors = adj[mid] ?? new Set();
            for (const far of farNeighbors) {
                if (far === busId) continue;
                const farType = nodeMap[far]?.data?.cimData?.rdfType ?? "";
                if (isConnectivityNode(farType)) {
                    busbarCNtoBusbar[far] = busId;
                }
            }
        }
    }

    return { busbarCNtoBusbar, busbarCNIds: new Set(Object.keys(busbarCNtoBusbar)) };
}

/**
 * Pre-process the graph for SLD layout:
 *
 * 1. Remove busbar CN nodes entirely; remap edges that referenced them to
 *    point at the busbar node instead.
 * 2. If showTerminals=false, also collapse terminal nodes (bridging edges
 *    from equipment directly to CN / busbar).
 * 3. Remove the terminals between busbar and its CN regardless of showTerminals
 *    (those are never useful to display — the busbar IS the visual element).
 *
 * Returns the cleaned graph ready for positional layout.
 */
function preprocessGraph(
    nodes: CimNode[],
    edges: Edge[],
    showTerminals: boolean
): { nodes: CimNode[]; edges: Edge[] } {
    const nodeMap: Record<string, CimNode> = {};
    for (const n of nodes) nodeMap[n.id] = n;

    const { busbarCNtoBusbar, busbarCNIds } = findBusbarCNs(nodes, edges);

    // --- Step 1: Find terminals that sit between a busbar and its CN ---
    // These are always removed regardless of showTerminals.
    const busbarTerminalIds = new Set<string>();
    const adj: Record<string, Set<string>> = {};
    for (const e of edges) {
        if (!adj[e.source]) adj[e.source] = new Set();
        if (!adj[e.target]) adj[e.target] = new Set();
        adj[e.source].add(e.target);
        adj[e.target].add(e.source);
    }

    const allTerminalIds = new Set<string>();
    const busbarNodeIds = new Set<string>();
    for (const n of nodes) {
        const rt = n.data?.cimData?.rdfType ?? "";
        if (isTerminal(rt)) allTerminalIds.add(n.id);
        if (isBusbar(rt)) busbarNodeIds.add(n.id);
    }

    // A terminal is a "busbar terminal" if it connects to both a busbar and a busbar CN
    for (const tId of allTerminalIds) {
        const tNeighbors = adj[tId] ?? new Set();
        let touchesBusbar = false;
        let touchesBusbarCN = false;
        for (const n of tNeighbors) {
            if (busbarNodeIds.has(n)) touchesBusbar = true;
            if (busbarCNIds.has(n)) touchesBusbarCN = true;
        }
        if (touchesBusbar || touchesBusbarCN) {
            // Check: one neighbor is busbar, the other is CN (or vice versa)
            // Actually, the pattern is Terminal connects to both busbar and CN
            if (touchesBusbar && touchesBusbarCN) {
                busbarTerminalIds.add(tId);
            } else if (touchesBusbar) {
                // Terminal between busbar and something — check if the "something" is a busbar CN
                // This handles edge directionality: the terminal might connect busbar↔CN
                busbarTerminalIds.add(tId);
            }
        }
    }

    // --- Step 2: Determine which node IDs to remove ---
    const removeIds = new Set<string>();
    // Always remove busbar CNs and busbar-specific terminals
    for (const id of busbarCNIds) removeIds.add(id);
    for (const id of busbarTerminalIds) removeIds.add(id);

    // If hiding terminals, remove ALL remaining terminal nodes
    const nonBusbarTerminals = new Set<string>();
    if (!showTerminals) {
        for (const tId of allTerminalIds) {
            if (!busbarTerminalIds.has(tId)) {
                removeIds.add(tId);
                nonBusbarTerminals.add(tId);
            }
        }
    }

    // --- Step 3: Remap edges ---
    // For each removed node, we need to "bridge" across it:
    // If A → removed → B, create A → B (with remapping busbar CN → busbar)

    // First, remap any edge endpoints that reference a busbar CN to the busbar
    let remappedEdges = edges.map((e) => {
        let src = e.source;
        let tgt = e.target;
        if (busbarCNtoBusbar[src]) src = busbarCNtoBusbar[src];
        if (busbarCNtoBusbar[tgt]) tgt = busbarCNtoBusbar[tgt];
        if (src === e.source && tgt === e.target) return e;
        return { ...e, source: src, target: tgt, id: `e${src}-${tgt}` };
    });

    // Now bridge across removed terminal nodes
    const terminalIdsToRemove = new Set([...busbarTerminalIds, ...nonBusbarTerminals]);

    if (terminalIdsToRemove.size > 0) {
        // Build adjacency from the remapped edges
        const adjR: Record<string, Set<string>> = {};
        for (const e of remappedEdges) {
            if (!adjR[e.source]) adjR[e.source] = new Set();
            if (!adjR[e.target]) adjR[e.target] = new Set();
            adjR[e.source].add(e.target);
            adjR[e.target].add(e.source);
        }

        const bridgedEdges: Edge[] = [];
        const seenBridgeIds = new Set<string>();

        // Build edge lookup for preserving properties
        const edgeByKey: Record<string, Edge> = {};
        for (const e of remappedEdges) {
            edgeByKey[`${e.source}->${e.target}`] = e;
            edgeByKey[`${e.target}->${e.source}`] = e;
        }

        for (const tId of terminalIdsToRemove) {
            const neighbors = Array.from(adjR[tId] ?? []);
            // Terminal connects exactly two nodes: equipment and CN/busbar
            // Bridge: for each pair of non-removed neighbors, create a direct edge
            const keptNeighbors = neighbors.filter((n) => !removeIds.has(n));
            for (let i = 0; i < keptNeighbors.length; i++) {
                for (let j = i + 1; j < keptNeighbors.length; j++) {
                    const a = keptNeighbors[i];
                    const b = keptNeighbors[j];
                    // Determine direction: equipment → CN/busbar
                    const aType = nodeMap[a]?.data?.cimData?.rdfType ?? "";
                    const bType = nodeMap[b]?.data?.cimData?.rdfType ?? "";
                    let src = a,
                        tgt = b;
                    if (isConnectivityNode(aType) || isBusbar(aType)) {
                        src = b;
                        tgt = a;
                    }
                    const bridgeId = `e${src}-${tgt}`;
                    if (!seenBridgeIds.has(bridgeId) && !seenBridgeIds.has(`e${tgt}-${src}`)) {
                        seenBridgeIds.add(bridgeId);
                        // Inherit style from one of the original edges
                        const origEdge =
                            edgeByKey[`${tId}->${a}`] ??
                            edgeByKey[`${a}->${tId}`] ??
                            edgeByKey[`${tId}->${b}`];
                        bridgedEdges.push({
                            id: bridgeId,
                            source: src,
                            target: tgt,
                            ...edgeTemplate,
                            ...(origEdge?.type ? { type: origEdge.type } : {}),
                        } as Edge);
                    }
                }
            }
        }

        // Keep edges that don't involve any removed node
        const keptEdges = remappedEdges.filter(
            (e) => !removeIds.has(e.source) && !removeIds.has(e.target)
        );

        // Deduplicate: prefer kept edges over bridged (avoid duplicates)
        const keptIds = new Set(keptEdges.map((e) => e.id));
        const uniqueBridged = bridgedEdges.filter((e) => !keptIds.has(e.id));

        remappedEdges = [...keptEdges, ...uniqueBridged];
    } else {
        // Just remove edges that reference removed nodes
        remappedEdges = remappedEdges.filter(
            (e) => !removeIds.has(e.source) && !removeIds.has(e.target)
        );
    }

    // Deduplicate edges by id (remapping may create duplicates like A→busbar twice)
    const edgeById: Record<string, Edge> = {};
    for (const e of remappedEdges) {
        // Also remove self-loops (e.g., busbar→busbar from CN remapping)
        if (e.source === e.target) continue;
        edgeById[e.id] = e;
    }

    const finalNodes = nodes.filter((n) => !removeIds.has(n.id));
    const finalEdges = Object.values(edgeById);

    return { nodes: finalNodes, edges: finalEdges };
}

// ── Bay detection (on pre-processed graph) ────────────────────────────

interface BayColumn {
    bayName: string;
    /** Ordered node IDs from busbar-side to endpoint */
    nodeIds: string[];
}

/**
 * Build adjacency from edges.
 */
function buildAdjacency(edges: Edge[]): Record<string, Set<string>> {
    const adj: Record<string, Set<string>> = {};
    for (const e of edges) {
        if (!adj[e.source]) adj[e.source] = new Set();
        if (!adj[e.target]) adj[e.target] = new Set();
        adj[e.source].add(e.target);
        adj[e.target].add(e.source);
    }
    return adj;
}

/**
 * Detect bays using CIM container info or connectivity walking.
 * Operates on the pre-processed graph (no busbar CNs, optionally no terminals).
 */
function detectBays(
    vlNodeIds: string[],
    nodeMap: Record<string, CimNode>,
    adj: Record<string, Set<string>>,
    busbarIds: Set<string>,
    cnIds: Set<string>,
    containerInfo?: Record<
        string,
        { containerName: string; containerType: string; vlName?: string }
    >
): BayColumn[] {
    // Strategy 1: CIM Bay container info
    if (containerInfo) {
        const bayGroups: Record<string, string[]> = {};
        const nodeIdsInBays = new Set<string>();

        for (const nodeId of vlNodeIds) {
            if (busbarIds.has(nodeId) || cnIds.has(nodeId)) continue;
            const node = nodeMap[nodeId];
            if (!node) continue;
            const mrid = node.data?.cimData?.mRID as string | undefined;
            if (!mrid) continue;
            const info = containerInfo[mrid];
            if (info && info.containerType === "Bay") {
                const bayName = info.containerName;
                if (!bayGroups[bayName]) bayGroups[bayName] = [];
                bayGroups[bayName].push(nodeId);
                nodeIdsInBays.add(nodeId);
            }
        }

        if (Object.keys(bayGroups).length > 0) {
            const bays: BayColumn[] = [];
            for (const [bayName, ids] of Object.entries(bayGroups)) {
                const ordered = orderByDistanceFromBusbar(ids, nodeMap, adj, busbarIds);
                bays.push({ bayName, nodeIds: ordered });
            }

            // Collect unassigned equipment
            const unassigned = vlNodeIds.filter(
                (id) =>
                    !nodeIdsInBays.has(id) && !busbarIds.has(id) && !cnIds.has(id) && nodeMap[id]
            );
            if (unassigned.length > 0) {
                bays.push({
                    bayName: "Other",
                    nodeIds: orderByDistanceFromBusbar(unassigned, nodeMap, adj, busbarIds),
                });
            }
            return bays;
        }
    }

    // Strategy 2: Walk connectivity from busbars
    return detectBaysByConnectivity(vlNodeIds, nodeMap, adj, busbarIds, cnIds);
}

/**
 * Walk from busbars to detect bay paths.
 * Since busbar CNs are already removed, busbars connect directly to
 * equipment (or to non-busbar CNs if terminals were collapsed).
 */
function detectBaysByConnectivity(
    vlNodeIds: string[],
    nodeMap: Record<string, CimNode>,
    adj: Record<string, Set<string>>,
    busbarIds: Set<string>,
    cnIds: Set<string>
): BayColumn[] {
    const vlSet = new Set(vlNodeIds);
    const visited = new Set<string>();
    const bays: BayColumn[] = [];
    let bayIndex = 0;

    // Mark busbars as visited
    for (const busId of busbarIds) visited.add(busId);

    // From each busbar, find adjacent equipment/CN nodes to start bays
    for (const busId of busbarIds) {
        const busNeighbors = Array.from(adj[busId] ?? []).filter(
            (n) => vlSet.has(n) && !visited.has(n) && !busbarIds.has(n)
        );

        for (const startId of busNeighbors) {
            if (visited.has(startId)) continue;

            // BFS from this starting node to find all connected equipment in the bay
            const bayNodes: string[] = [];
            const queue = [startId];

            while (queue.length > 0) {
                const current = queue.shift()!;
                if (visited.has(current)) continue;
                visited.add(current);

                if (vlSet.has(current)) {
                    bayNodes.push(current);
                }

                for (const neighbor of adj[current] ?? []) {
                    if (!visited.has(neighbor) && vlSet.has(neighbor) && !busbarIds.has(neighbor)) {
                        queue.push(neighbor);
                    }
                }
            }

            if (bayNodes.length > 0) {
                bayIndex++;
                bays.push({
                    bayName: `Bay ${bayIndex}`,
                    nodeIds: orderByDistanceFromBusbar(bayNodes, nodeMap, adj, busbarIds),
                });
            }
        }
    }

    // Remaining unvisited VL nodes
    const remaining = vlNodeIds.filter((id) => !visited.has(id));
    if (remaining.length > 0) {
        bayIndex++;
        bays.push({
            bayName: `Bay ${bayIndex}`,
            nodeIds: orderByDistanceFromBusbar(remaining, nodeMap, adj, busbarIds),
        });
    }

    return bays;
}

/**
 * Order nodes by BFS distance from busbars.
 * Ties broken by equipment type priority.
 */
function orderByDistanceFromBusbar(
    nodeIds: string[],
    nodeMap: Record<string, CimNode>,
    adj: Record<string, Set<string>>,
    busbarIds: Set<string>
): string[] {
    if (nodeIds.length <= 1) return nodeIds;

    const dist: Record<string, number> = {};
    const queue: string[] = [];

    for (const busId of busbarIds) {
        dist[busId] = 0;
        queue.push(busId);
    }

    while (queue.length > 0) {
        const current = queue.shift()!;
        for (const neighbor of adj[current] ?? []) {
            if (!(neighbor in dist)) {
                dist[neighbor] = (dist[current] ?? 0) + 1;
                queue.push(neighbor);
            }
        }
    }

    return [...nodeIds].sort((a, b) => {
        const da = dist[a] ?? 999;
        const db = dist[b] ?? 999;
        if (da !== db) return da - db;
        const pa = equipmentSortPriority(nodeMap[a]?.data?.cimData?.rdfType ?? "");
        const pb = equipmentSortPriority(nodeMap[b]?.data?.cimData?.rdfType ?? "");
        return pa - pb;
    });
}

// ── Core layout for a single voltage level ────────────────────────────

interface PositionedNode {
    id: string;
    x: number;
    y: number;
    /** Override width for this node (e.g., busbar gets wide) */
    widthOverride?: number;
    /** Override height for this node */
    heightOverride?: number;
}

/**
 * Layout a single voltage level in SLD style.
 * Operates on the pre-processed graph (busbar CNs removed, terminals
 * optionally removed).
 */
function layoutVoltageLevel(
    vlNodeIds: string[],
    nodeMap: Record<string, CimNode>,
    adj: Record<string, Set<string>>,
    bays: BayColumn[],
    showTerminals: boolean
): { positioned: PositionedNode[]; vlWidth: number; vlHeight: number } {
    const positioned: PositionedNode[] = [];
    const placedNodes = new Set<string>();

    // Classify nodes
    const busbarNodeIds: string[] = [];
    const terminalNodeIds: string[] = [];

    for (const nodeId of vlNodeIds) {
        const rdfType = nodeMap[nodeId]?.data?.cimData?.rdfType ?? "";
        if (isBusbar(rdfType)) busbarNodeIds.push(nodeId);
        else if (isTerminal(rdfType)) terminalNodeIds.push(nodeId);
    }

    const busbarSet = new Set(busbarNodeIds);

    const spacing = showTerminals ? EQUIPMENT_SPACING_Y_WITH_TERMINALS : EQUIPMENT_SPACING_Y;

    // ── Place busbars horizontally at top ─────────────────────────────
    const numBays = Math.max(bays.length, 1);
    const busbarWidth = Math.max(BUSBAR_MIN_WIDTH, numBays * BAY_SPACING_X + VL_PADDING);

    let busbarY = VL_LABEL_HEIGHT + VL_PADDING;
    for (const busId of busbarNodeIds) {
        positioned.push({
            id: busId,
            x: VL_PADDING,
            y: busbarY,
            widthOverride: busbarWidth,
            heightOverride: BUSBAR_HEIGHT,
        });
        placedNodes.add(busId);
        busbarY += BUSBAR_Y_SPACING;
    }

    const busAreaBottom =
        VL_LABEL_HEIGHT + VL_PADDING + Math.max(busbarNodeIds.length, 0) * BUSBAR_Y_SPACING;
    const bayStartY = busAreaBottom + BAY_TOP_MARGIN;

    // ── Place bays as vertical columns ────────────────────────────────
    let bayX = VL_PADDING;

    for (const bay of bays) {
        let equipY = bayStartY;

        for (const nodeId of bay.nodeIds) {
            if (placedNodes.has(nodeId)) continue;
            if (busbarSet.has(nodeId)) continue;

            // Place this node
            positioned.push({ id: nodeId, x: bayX, y: equipY });
            placedNodes.add(nodeId);

            // If showing terminals, place terminals between this node and its
            // already-placed neighbors
            if (showTerminals) {
                for (const neighbor of adj[nodeId] ?? []) {
                    if (!placedNodes.has(neighbor)) continue;
                    if (busbarSet.has(neighbor)) continue;
                    const nType = nodeMap[neighbor]?.data?.cimData?.rdfType ?? "";
                    if (!isTerminal(nType)) continue;
                    // This neighbor is a terminal already placed — skip
                    // (terminals are placed below, not here)
                }
            }

            equipY += spacing;
        }

        // If showing terminals: place terminal nodes in this bay column
        // Terminals connect between two non-terminal nodes. Position them
        // between their two neighbors.
        if (showTerminals) {
            for (const tId of terminalNodeIds) {
                if (placedNodes.has(tId)) continue;
                const tNeighbors = Array.from(adj[tId] ?? []);
                // Check if this terminal's neighbors are in this bay
                const placedNeighborsInBay = tNeighbors.filter(
                    (n) => placedNodes.has(n) && !busbarSet.has(n)
                );
                if (placedNeighborsInBay.length === 0) continue;

                // Find positions of neighbors
                const neighborPositions = placedNeighborsInBay
                    .map((n) => positioned.find((p) => p.id === n))
                    .filter((p): p is PositionedNode => p !== undefined);

                if (neighborPositions.length > 0) {
                    // Check that at least one neighbor is in this bay's x column
                    const inThisBay = neighborPositions.some(
                        (p) => Math.abs(p.x - bayX) < BAY_SPACING_X / 2
                    );
                    if (!inThisBay) continue;

                    // Position halfway between neighbors vertically
                    const avgY =
                        neighborPositions.reduce((s, p) => s + p.y, 0) / neighborPositions.length;
                    // Offset slightly below the average
                    positioned.push({ id: tId, x: bayX, y: avgY + TERMINAL_OFFSET_Y / 2 });
                    placedNodes.add(tId);
                }
            }
        }

        bayX += BAY_SPACING_X;
    }

    // ── Place any remaining terminal nodes ────────────────────────────
    if (showTerminals) {
        for (const tId of terminalNodeIds) {
            if (placedNodes.has(tId)) continue;
            const tNeighbors = Array.from(adj[tId] ?? []);
            let bestPos: PositionedNode | undefined;
            for (const n of tNeighbors) {
                bestPos = positioned.find((p) => p.id === n);
                if (bestPos) break;
            }
            if (bestPos) {
                positioned.push({ id: tId, x: bestPos.x, y: bestPos.y + TERMINAL_OFFSET_Y });
            } else {
                positioned.push({ id: tId, x: bayX, y: bayStartY });
                bayX += NODE_WIDTH + 20;
            }
            placedNodes.add(tId);
        }
    }

    // ── Place any remaining unplaced nodes ────────────────────────────
    for (const nodeId of vlNodeIds) {
        if (placedNodes.has(nodeId)) continue;
        positioned.push({ id: nodeId, x: bayX, y: bayStartY });
        placedNodes.add(nodeId);
        bayX += BAY_SPACING_X;
    }

    // ── Compute bounding box ──────────────────────────────────────────
    let maxX = 0;
    let maxY = 0;
    for (const pos of positioned) {
        const w = pos.widthOverride ?? nodeMap[pos.id]?.measured?.width ?? NODE_WIDTH;
        const h = pos.heightOverride ?? nodeMap[pos.id]?.measured?.height ?? NODE_HEIGHT;
        maxX = Math.max(maxX, pos.x + w);
        maxY = Math.max(maxY, pos.y + h);
    }
    maxX = Math.max(maxX, VL_PADDING + busbarWidth);

    return {
        positioned,
        vlWidth: maxX + VL_PADDING,
        vlHeight: maxY + VL_PADDING,
    };
}

// ── Edge handle assignment for vertical SLD routing ───────────────────

const VERTICAL_THRESHOLD = 10;

/**
 * Assign sourceHandle / targetHandle on SLD edges so that connections
 * between vertically-stacked nodes exit from bottom→top instead of left→right.
 */
function assignSldEdgeHandles(
    edges: Edge[],
    absPos: Record<string, { x: number; y: number }>
): Edge[] {
    return edges.map((e) => {
        const sPos = absPos[e.source];
        const tPos = absPos[e.target];

        if (sPos && tPos) {
            const dy = tPos.y - sPos.y;
            if (dy > VERTICAL_THRESHOLD) {
                return {
                    ...e,
                    type: "smoothstep" as const,
                    sourceHandle: "source-bottom",
                    targetHandle: "target-top",
                };
            } else if (dy < -VERTICAL_THRESHOLD) {
                return {
                    ...e,
                    type: "smoothstep" as const,
                    sourceHandle: "source-top",
                    targetHandle: "target-bottom",
                };
            }
        }
        return { ...e, type: "smoothstep" as const };
    });
}

// ── Main SLD layout functions ─────────────────────────────────────────

/**
 * Creates the SLD layout for a substation graph built from CIM data.
 * Called during initial graph creation (from createSubstationNodesAndEdges).
 *
 * @param showTerminals  If false, terminals are collapsed before layout
 *                       for a more compact diagram.
 */
export async function sldLayoutSubstationGraph(
    nodes: CimNode[],
    edges: Edge[],
    substation: CIM,
    voltageLevels: { vl: IdentifiedObject; bayIds: string[] }[],
    rdfIdToVlId: Record<string, string>,
    data: SubstationComponents,
    showTerminals: boolean = false
): Promise<{ nodes: CimNode[]; edges: Edge[] }> {
    // --- Pre-process: remove busbar CNs (always) and terminals (if hidden) ---
    const processed = preprocessGraph(nodes, edges, showTerminals);
    const pNodes = processed.nodes;
    const pEdges = processed.edges;

    const adj = buildAdjacency(pEdges);

    // Build lookups
    const nodeMap: Record<string, CimNode> = {};
    for (const node of pNodes) nodeMap[node.id] = node;

    // Build VL id -> name map
    const vlNameMap: Record<string, string> = {};
    for (const { vl } of voltageLevels) vlNameMap[vl.mRID] = vl.name;

    // Partition nodes by voltage level
    // (rdfIdToVlId was built from the original nodes; some IDs may have been removed
    //  during preprocessing, but the map is still valid for surviving nodes)
    const vlNodeMap: Record<string, string[]> = {};
    const noVlNodeIds: string[] = [];
    for (const node of pNodes) {
        if (node.type === "substationGroup") continue; // skip group nodes
        const vlId = rdfIdToVlId[node.id];
        if (vlId) {
            if (!vlNodeMap[vlId]) vlNodeMap[vlId] = [];
            vlNodeMap[vlId].push(node.id);
        } else {
            noVlNodeIds.push(node.id);
        }
    }

    const groupId = `group-${substation.rdfId}`;
    const vlGroupResults: { groupNode: CimNode; childNodes: CimNode[] }[] = [];
    let currentVlY = VL_LABEL_HEIGHT + VL_PADDING;

    // Sort VLs by name
    const sortedVlIds = Object.keys(vlNodeMap).sort((a, b) =>
        (vlNameMap[a] ?? a).localeCompare(vlNameMap[b] ?? b)
    );

    for (const vlId of sortedVlIds) {
        const vlNodeIds = vlNodeMap[vlId];
        if (!vlNodeIds || vlNodeIds.length === 0) continue;

        // Classify for bay detection
        const busbarIds = new Set(
            vlNodeIds.filter((id) => isBusbar(nodeMap[id]?.data?.cimData?.rdfType ?? ""))
        );
        const cnIds = new Set(
            vlNodeIds.filter((id) => isConnectivityNode(nodeMap[id]?.data?.cimData?.rdfType ?? ""))
        );

        // Detect bays
        const bays = detectBays(vlNodeIds, nodeMap, adj, busbarIds, cnIds, data.containerInfo);

        // Layout this VL
        const { positioned, vlWidth, vlHeight } = layoutVoltageLevel(
            vlNodeIds,
            nodeMap,
            adj,
            bays,
            showTerminals
        );

        // Create VL group node
        const vlGroupId = `vl-group-${vlId}`;
        const vlGroupNode: CimNode = {
            id: vlGroupId,
            type: "substationGroup",
            position: { x: GROUP_PADDING, y: currentVlY },
            style: { width: vlWidth, height: vlHeight },
            data: {
                cimData: { rdfId: vlId, rdfType: "cim:VoltageLevel" } as CIM,
                otherData: {
                    color: undefined,
                    expanded: undefined,
                    isGroup: true,
                    groupType: "voltageLevel",
                },
                label: vlNameMap[vlId] || vlId,
                substationName: vlNameMap[vlId] || "",
                groupType: "voltageLevel",
            },
            selectable: true,
            draggable: true,
            parentId: groupId,
            extent: "parent" as const,
            zIndex: 0,
        } as CimNode;

        // Build child nodes with positions relative to VL group
        const childNodes: CimNode[] = positioned.map((pos) => {
            const orig = nodeMap[pos.id];
            const style: Record<string, unknown> = {};
            if (pos.widthOverride) style.width = pos.widthOverride;
            if (pos.heightOverride) style.height = pos.heightOverride;
            return {
                ...orig,
                position: { x: pos.x, y: pos.y },
                parentId: vlGroupId,
                extent: "parent" as const,
                ...(Object.keys(style).length > 0 ? { style } : {}),
            };
        });

        vlGroupResults.push({ groupNode: vlGroupNode, childNodes });
        currentVlY += vlHeight + VL_SPACING_Y;
    }

    // ── Handle nodes not in any VL ────────────────────────────────────
    const noVlChildNodes: CimNode[] = [];
    let noVlX = GROUP_PADDING;
    for (const nodeId of noVlNodeIds) {
        const origNode = nodeMap[nodeId];
        if (origNode) {
            noVlChildNodes.push({
                ...origNode,
                position: { x: noVlX, y: currentVlY },
                parentId: groupId,
                extent: "parent" as const,
            });
            noVlX += BAY_SPACING_X;
        }
    }

    // ── Compute substation group bounding box ─────────────────────────
    const allTopLevel = [...vlGroupResults.map((r) => r.groupNode), ...noVlChildNodes];
    let gMaxX = 0;
    let gMaxY = 0;
    for (const node of allTopLevel) {
        const w = (node.style as any)?.width ?? node.measured?.width ?? NODE_WIDTH;
        const h = (node.style as any)?.height ?? node.measured?.height ?? NODE_HEIGHT;
        gMaxX = Math.max(gMaxX, node.position.x + w);
        gMaxY = Math.max(gMaxY, node.position.y + h);
    }
    if (gMaxX === 0) {
        gMaxX = 800;
        gMaxY = 600;
    }

    const substationGroupNode: CimNode = {
        id: groupId,
        type: "substationGroup",
        position: { x: 0, y: 0 },
        style: { width: gMaxX + GROUP_PADDING, height: gMaxY + GROUP_PADDING + LABEL_HEIGHT },
        data: {
            cimData: { ...substation },
            otherData: {
                color: undefined,
                expanded: undefined,
                isGroup: true,
                groupType: "substation",
            },
            label: (substation as IdentifiedObject).name || substation.rdfId,
            substationName: (substation as IdentifiedObject).name || "",
            groupType: "substation",
        },
        selectable: true,
        draggable: true,
        zIndex: -1,
    } as CimNode;

    // ── Assemble (parents before children) ────────────────────────────
    const resultNodes: CimNode[] = [substationGroupNode];
    for (const { groupNode, childNodes } of vlGroupResults) {
        resultNodes.push(groupNode);
        resultNodes.push(...childNodes);
    }
    resultNodes.push(...noVlChildNodes);

    // ── Build absolute position map for edge handle assignment ────────
    const absPos: Record<string, { x: number; y: number }> = {};
    for (const { groupNode, childNodes } of vlGroupResults) {
        const vlX = groupNode.position.x;
        const vlY = groupNode.position.y;
        for (const child of childNodes) {
            absPos[child.id] = { x: vlX + child.position.x, y: vlY + child.position.y };
        }
    }
    for (const n of noVlChildNodes) {
        absPos[n.id] = { x: n.position.x, y: n.position.y };
    }

    // ── Use smoothstep edges with correct top/bottom handles ──────────
    const sldEdges = assignSldEdgeHandles(pEdges, absPos);

    return { nodes: resultNodes, edges: sldEdges };
}

/**
 * Re-layout an existing substation graph using SLD.
 * Called when the user switches to SLD mode from the UI.
 *
 * @param showTerminals  If false, terminals are collapsed for compact layout.
 */
export async function relayoutWithSld(
    nodes: CimNode[],
    edges: Edge[],
    showTerminals: boolean = false
): Promise<{ nodes: CimNode[]; edges: Edge[] }> {
    // --- Pre-process ---
    const processed = preprocessGraph(nodes, edges, showTerminals);
    const pNodes = processed.nodes;
    const pEdges = processed.edges;

    const adj = buildAdjacency(pEdges);

    const nodeMap: Record<string, CimNode> = {};
    for (const node of pNodes) nodeMap[node.id] = node;

    const substationGroup = pNodes.find(
        (n) => n.type === "substationGroup" && n.data?.groupType === "substation"
    );
    const vlGroups = pNodes.filter(
        (n) => n.type === "substationGroup" && n.data?.groupType === "voltageLevel"
    );
    const leafNodes = pNodes.filter((n) => n.type !== "substationGroup");

    if (!substationGroup) return { nodes: pNodes, edges: pEdges };

    const groupId = substationGroup.id;
    const vlGroupIds = new Set(vlGroups.map((v) => v.id));
    const vlToLeaves: Record<string, CimNode[]> = {};
    const noVlLeaves: CimNode[] = [];

    for (const leaf of leafNodes) {
        if (leaf.parentId && vlGroupIds.has(leaf.parentId)) {
            if (!vlToLeaves[leaf.parentId]) vlToLeaves[leaf.parentId] = [];
            vlToLeaves[leaf.parentId].push(leaf);
        } else {
            noVlLeaves.push(leaf);
        }
    }

    const vlGroupResults: { groupNode: CimNode; childNodes: CimNode[] }[] = [];
    let currentVlY = VL_LABEL_HEIGHT + VL_PADDING;

    for (const vlg of vlGroups) {
        const vlLeaves = vlToLeaves[vlg.id] || [];
        if (vlLeaves.length === 0) continue;

        const vlNodeIds = vlLeaves.map((n) => n.id);
        const busbarIds = new Set(
            vlNodeIds.filter((id) => isBusbar(nodeMap[id]?.data?.cimData?.rdfType ?? ""))
        );
        const cnIds = new Set(
            vlNodeIds.filter((id) => isConnectivityNode(nodeMap[id]?.data?.cimData?.rdfType ?? ""))
        );

        const bays = detectBaysByConnectivity(vlNodeIds, nodeMap, adj, busbarIds, cnIds);

        const { positioned, vlWidth, vlHeight } = layoutVoltageLevel(
            vlNodeIds,
            nodeMap,
            adj,
            bays,
            showTerminals
        );

        const updatedVlGroup: CimNode = {
            ...vlg,
            position: { x: GROUP_PADDING, y: currentVlY },
            style: { ...vlg.style, width: vlWidth, height: vlHeight },
            parentId: groupId,
            extent: "parent" as const,
        };

        const childNodes: CimNode[] = positioned.map((pos) => {
            const orig = nodeMap[pos.id];
            const style: Record<string, unknown> = {};
            if (pos.widthOverride) style.width = pos.widthOverride;
            if (pos.heightOverride) style.height = pos.heightOverride;
            return {
                ...orig,
                position: { x: pos.x, y: pos.y },
                parentId: vlg.id,
                extent: "parent" as const,
                ...(Object.keys(style).length > 0 ? { style } : {}),
            };
        });

        vlGroupResults.push({ groupNode: updatedVlGroup, childNodes });
        currentVlY += vlHeight + VL_SPACING_Y;
    }

    // No-VL leaves
    const noVlChildNodes: CimNode[] = [];
    let noVlX = GROUP_PADDING;
    for (const leaf of noVlLeaves) {
        noVlChildNodes.push({
            ...leaf,
            position: { x: noVlX, y: currentVlY },
            parentId: groupId,
            extent: "parent" as const,
        });
        noVlX += BAY_SPACING_X;
    }

    // Substation bounding box
    const allTopLevel = [...vlGroupResults.map((r) => r.groupNode), ...noVlChildNodes];
    let gMaxX = 0;
    let gMaxY = 0;
    for (const node of allTopLevel) {
        const w = (node.style as any)?.width ?? node.measured?.width ?? NODE_WIDTH;
        const h = (node.style as any)?.height ?? node.measured?.height ?? NODE_HEIGHT;
        gMaxX = Math.max(gMaxX, node.position.x + w);
        gMaxY = Math.max(gMaxY, node.position.y + h);
    }
    if (gMaxX === 0) {
        gMaxX = 800;
        gMaxY = 600;
    }

    const updatedGroup: CimNode = {
        ...substationGroup,
        position: { x: 0, y: 0 },
        style: {
            ...substationGroup.style,
            width: gMaxX + GROUP_PADDING,
            height: gMaxY + GROUP_PADDING + LABEL_HEIGHT,
        },
    };

    const resultNodes: CimNode[] = [updatedGroup];
    for (const { groupNode, childNodes } of vlGroupResults) {
        resultNodes.push(groupNode);
        resultNodes.push(...childNodes);
    }
    resultNodes.push(...noVlChildNodes);

    // Edge handle assignment
    const absPos: Record<string, { x: number; y: number }> = {};
    for (const { groupNode, childNodes } of vlGroupResults) {
        const vlX = groupNode.position.x;
        const vlY = groupNode.position.y;
        for (const child of childNodes) {
            absPos[child.id] = { x: vlX + child.position.x, y: vlY + child.position.y };
        }
    }
    for (const n of noVlChildNodes) {
        absPos[n.id] = { x: n.position.x, y: n.position.y };
    }

    const sldEdges = assignSldEdgeHandles(pEdges, absPos);

    return { nodes: resultNodes, edges: sldEdges };
}
