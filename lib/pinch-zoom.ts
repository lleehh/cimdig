// lib/pinch-zoom.ts
// Pure helper that creates a DOM WheelEvent handler for pinch zoom (ctrl+wheel).
// It implements zoom-to-cursor: the point under the pointer remains fixed on screen.

export interface ViewportLike {
  x: number;
  y: number;
  zoom: number;
}

export interface PinchZoomOptions {
  // functions provided by React Flow via useReactFlow
  getViewport: () => ViewportLike | undefined;
  // setViewport should exist in your reactflow version; if not, provide setCenter fallback.
  setViewport?: (vp: ViewportLike) => void;

  // fallback: if setViewport not available, you can provide a setCenter function instead:
  setCenter?: (x: number, y: number, opts?: { zoom?: number; duration?: number }) => void;

  // function that returns the DOM element used to compute client coords
  // (should be () => containerRef.current)
  getContainer: () => HTMLElement | null;

  minZoom: number;
  maxZoom: number;
  boost?: number; // amplify pinch delta
}

/**
 * Creates a DOM wheel event handler (for native wheel events) that:
 * - intercepts ctrl+wheel (pinch) events
 * - computes zoom-to-cursor
 * - updates the viewport via setViewport OR setCenter (if setViewport not available)
 *
 * The returned function expects a DOM WheelEvent (not React.WheelEvent).
 */
export function createPinchZoomHandler(options: PinchZoomOptions) {
  const {
    getViewport,
    setViewport,
    setCenter,
    getContainer,
    minZoom,
    maxZoom,
    boost = 30000000000.0,
  } = options;

  return function handleDomWheel(e: globalThis.WheelEvent) {
    // Only handle pinch gestures (ctrlKey on macOS); otherwise do nothing.
    if (!('ctrlKey' in e) || !e.ctrlKey) return;

    // prevent browser page zoom and other default behaviour
    e.preventDefault();
    e.stopPropagation();

    // compute delta (tweak multiplier if needed)
    const delta = -e.deltaY * 0.002 * boost;

    // read viewport
    let vp = undefined as ViewportLike | undefined;
    try {
      vp = typeof getViewport === 'function' ? getViewport() : undefined;
    } catch {
      vp = undefined;
    }
    if (!vp) return; // nothing to do

    // compute new zoom, clamped
    const newZoom = Math.max(minZoom, Math.min(maxZoom, vp.zoom + delta));

    // if nothing changed, do nothing
    if (Math.abs(newZoom - vp.zoom) < 1e-9) return;

    // compute pointer position relative to container
    const container = typeof getContainer === 'function' ? getContainer() : null;
    if (!container) {
      // fallback: center zoom (keeps prior behavior)
      if (typeof setViewport === 'function') {
        setViewport({ ...vp, zoom: newZoom });
      } else if (typeof setCenter === 'function') {
        // approximate: keep center same
        setCenter(0, 0, { zoom: newZoom, duration: 0 });
      }
      return;
    }

    const rect = container.getBoundingClientRect();
    const clientX = (e as globalThis.WheelEvent).clientX;
    const clientY = (e as globalThis.WheelEvent).clientY;

    // screen coordinates relative to container's top-left
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    // Map screen -> graph coordinates: graphX = (screenX - vp.x) / vp.zoom
    const graphX = (screenX - vp.x) / vp.zoom;
    const graphY = (screenY - vp.y) / vp.zoom;

    // After changing zoom to newZoom, keep graphX at same screen position:
    // newVp.x + graphX * newZoom = screenX  => newVp.x = screenX - graphX * newZoom
    const newX = screenX - graphX * newZoom;
    const newY = screenY - graphY * newZoom;

    if (typeof setViewport === 'function') {
      setViewport({ x: newX, y: newY, zoom: newZoom });
    } else if (typeof setCenter === 'function') {
      // If setViewport not available, compute center coordinates and call setCenter.
      // Convert new viewport x/y to center graph coordinates:
      // centerGraphX = (containerWidth / 2 - newVp.x) / newZoom
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      const centerGraphX = (containerWidth / 2 - newX) / newZoom;
      const centerGraphY = (containerHeight / 2 - newY) / newZoom;
      setCenter(centerGraphX, centerGraphY, { zoom: newZoom, duration: 0 });
    }
  };
}
