// Pure utilities used to compute minZoom / fit zoom for React Flow graphs.

export interface SimpleNode {
  id: string;
  position?: { x: number; y: number };
  width?: number;
  height?: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Compute bounding box for a set of nodes.
 */
export function getBoundingBox(
  nodes: SimpleNode[],
  defaultWidth = 180,
  defaultHeight = 40
): BoundingBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    const px = n.position?.x ?? 0;
    const py = n.position?.y ?? 0;
    const w = n.width ?? defaultWidth;
    const h = n.height ?? defaultHeight;

    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px + w);
    maxY = Math.max(maxY, py + h);
  }

  if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 1, height: 1 };
  }

  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  return { minX, minY, maxX, maxY, width, height };
}

/**
 * Apply padding to graph size.
 */
export function computePaddedSize(
  graphWidth: number,
  graphHeight: number,
  padding = 0.2
) {
  return {
    paddedWidth: graphWidth * (1 + padding),
    paddedHeight: graphHeight * (1 + padding),
  };
}

/**
 * Compute zoom that fits the padded graph into the viewport.
 */
export function computeFitZoom(
  viewportWidth: number,
  viewportHeight: number,
  paddedWidth: number,
  paddedHeight: number
) {
  if (paddedWidth <= 0 || paddedHeight <= 0) return 1;
  const zoomX = viewportWidth / paddedWidth;
  const zoomY = viewportHeight / paddedHeight;
  return Math.min(zoomX, zoomY);
}

/**
 * Decide the final minZoom without snapping the user's camera.
 */
export function computeDesiredMinZoom(
  fitZoom: number,
  prevMinZoom: number | undefined,
  currentViewportZoom?: number,
  minClamp = 0.0001
): number {
  const prev = typeof prevMinZoom === 'number' ? prevMinZoom : 0.05;
  let desired = fitZoom;

  if (typeof currentViewportZoom === 'number') {
    if (fitZoom > prev) {
      // Graph got smaller -> don't snap user inward
      desired = Math.min(fitZoom, currentViewportZoom);
    } else {
      // Graph got bigger -> allow zooming out more
      desired = fitZoom;
    }
  } else {
    // No viewport info -> allow decreases, block increases
    desired = fitZoom < prev ? fitZoom : prev;
  }

  if (!Number.isFinite(desired)) desired = prev;
  desired = Math.max(minClamp, Math.min(desired, 1));
  return desired;
}
