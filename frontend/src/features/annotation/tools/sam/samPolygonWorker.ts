/**
 * samPolygonWorker.ts
 *
 * Web Worker that handles heavy computations for SAM mask → polygon conversion
 * and mask rendering. These operations are moved off the main thread to prevent
 * UI freezes when the user presses Enter to commit a SAM mask as a polygon.
 *
 * ─── Operations ─────────────────────────────────────────────────────────────
 *   MASK_TO_POLYGON   : Convert binary mask Uint8Array → polygon coordinates
 *                       using Moore-Neighbor contour tracing + Douglas-Peucker
 *   MASK_TO_BLOB_URL  : Convert binary mask Uint8Array → PNG blob (rendered
 *                       as semi-transparent colored overlay)
 *   CROP_SCALE_MASK   : Crop padding from model output tensor and scale to
 *                       original image dimensions (nearest-neighbor)
 *
 * ─── Message Protocol ──────────────────────────────────────────────────────
 *   type: 'MASK_TO_POLYGON'
 *     data: { maskData: Uint8Array, width, height, epsilon }
 *     response: { type: 'POLYGON_RESULT', data: { coordinates: number[] } }
 *     OR error response
 *
 *   type: 'MASK_TO_BLOB_URL'
 *     data: { maskData: Uint8Array, width, height }
 *     response: { type: 'BLOB_URL_RESULT', data: { blobUrl: string } }
 *     OR error response
 */

// ─── Moore-Neighbor Direction Vectors ──────────────────────────────────────
// Order: right, down-right, down, down-left, left, up-left, up, up-right
const DIRS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1],
  [-1, 0], [-1, -1], [0, -1], [1, -1],
];

/**
 * Convert a binary mask (Uint8Array) to a polygon by finding the outer contour.
 *
 * Uses Moore-Neighbor tracing with a robust stopping criterion, a contour-size
 * cap to prevent runaway loops, and an iterative Douglas-Peucker simplification
 * to avoid call-stack overflows on large masks.
 *
 * @param maskData  — Flat Uint8Array of size width × height (0 = background, >0 = mask)
 * @param width     — Width of the mask in pixels
 * @param height    — Height of the mask in pixels
 * @param epsilon   — Douglas-Peucker simplification factor (higher = fewer points)
 * @returns Flat array of [x0,y0, x1,y1, …] coordinate pairs.
 */
function maskToPolygonImpl(
  maskData: Uint8Array,
  width: number,
  height: number,
  epsilon: number = 1.0
): number[] {
  // ── Step 1: Find the first foreground pixel (top-leftmost) ──────────────
  let startX = -1, startY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (maskData[y * width + x] > 0) {
        startX = x;
        startY = y;
        break;
      }
    }
    if (startX >= 0) break;
  }

  if (startX < 0) return []; // No foreground pixels

  const isForeground = (px: number, py: number): boolean => {
    if (px < 0 || px >= width || py < 0 || py >= height) return false;
    return maskData[py * width + px] > 0;
  };

  // ── Step 2: Moore-Neighbor contour tracing ─────────────────────────────
  // MAX_CONTOUR must be large enough to complete a full boundary loop for any
  // mask size. 8000 was too small for 1080p+ images: a large object's perimeter
  // can easily exceed 8000 pixels, causing the loop to cut off early. When the
  // loop exits without returning to start, Konva's closed={true} draws a straight
  // line from the last point back to start, slicing through the mask interior.
  //
  // 500k iterations of simple array indexing take ~20ms in a worker — acceptable.
  // After tracing, we subsample to ≤5000 points so Douglas-Peucker stays fast.
  const MAX_CONTOUR = 500_000;

  const contour: [number, number][] = [];
  let currentX = startX;
  let currentY = startY;
  let prevDir = 6; // Start searching from direction 6 (up)

  // Robust stopping: stop when we return to the starting pixel after having
  // visited at least one other pixel. The old criterion (prevDir === 6) was
  // rarely satisfied for irregular shapes, causing the full MAX_CONTOUR loop.
  let leftStart = false;

  while (contour.length < MAX_CONTOUR) {
    contour.push([currentX, currentY]);

    const startSearchDir = (prevDir + 1) % 8;
    let found = false;

    for (let i = 0; i < 8; i++) {
      const dirIdx = (startSearchDir + i) % 8;
      const [dx, dy] = DIRS[dirIdx];
      const nx = currentX + dx;
      const ny = currentY + dy;

      if (isForeground(nx, ny)) {
        currentX = nx;
        currentY = ny;
        prevDir = dirIdx;
        found = true;
        break;
      }
    }

    if (!found) break;

    if (!leftStart && (currentX !== startX || currentY !== startY)) {
      leftStart = true;
    }
    if (leftStart && currentX === startX && currentY === startY) break;
  }

  if (contour.length <= 2) return contour.flat();

  // ── Step 3: Uniform subsampling if contour is very large ───────────────
  // Keep up to 5000 points before Douglas-Peucker to preserve boundary detail
  // while ensuring the simplification step stays fast.
  let pts: [number, number][] = contour;
  if (pts.length > 5_000) {
    const step = Math.ceil(pts.length / 5_000);
    pts = pts.filter((_, i) => i % step === 0);
  }

  // ── Step 4: Iterative Douglas-Peucker (no recursion → no stack overflow) ─
  const simplified = iterativeDouglasPeucker(pts, epsilon);
  return simplified.flat();
}

/**
 * Iterative Douglas-Peucker simplification using an explicit stack.
 * Replaces the old recursive version which stack-overflowed on large contours.
 */
function iterativeDouglasPeucker(
  points: [number, number][],
  epsilon: number
): [number, number][] {
  if (points.length <= 2) return points;

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  const stack: [number, number][] = [[0, points.length - 1]];

  while (stack.length > 0) {
    const [start, end] = stack.pop()!;
    if (end - start <= 1) continue;

    const p1 = points[start];
    const p2 = points[end];
    let maxDist = 0;
    let maxIdx = start;

    for (let i = start + 1; i < end; i++) {
      const d = perpendicularDistance(points[i], p1, p2);
      if (d > maxDist) { maxDist = d; maxIdx = i; }
    }

    if (maxDist > epsilon) {
      keep[maxIdx] = 1;
      stack.push([start, maxIdx]);
      stack.push([maxIdx, end]);
    }
  }

  return points.filter((_, i) => keep[i] === 1);
}

function perpendicularDistance(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number {
  const [px, py] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

/**
 * Render mask data as a colored PNG blob inside the worker using OffscreenCanvas.
 *
 * @returns A PNG blob URL string (created with URL.createObjectURL inside worker, sent back as string)
 */
async function maskToBlobUrlImpl(
  maskData: Uint8Array,
  width: number,
  height: number
): Promise<string> {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context for mask rendering');
  }

  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < maskData.length; i++) {
    const pixelOffset = i * 4;
    if (maskData[i] > 0) {
      imageData.data[pixelOffset] = 59;      // R
      imageData.data[pixelOffset + 1] = 130; // G
      imageData.data[pixelOffset + 2] = 246; // B
      imageData.data[pixelOffset + 3] = 153; // A (~60% opacity)
    } else {
      imageData.data[pixelOffset] = 0;
      imageData.data[pixelOffset + 1] = 0;
      imageData.data[pixelOffset + 2] = 0;
      imageData.data[pixelOffset + 3] = 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return URL.createObjectURL(blob);
}

/**
 * Crop padding from a model output tensor and scale to original image dimensions.
 */
function cropAndScaleMaskImpl(
  tensorData: Float32Array,
  tensorSize: number,
  padX: number,
  padY: number,
  scaledW: number,
  scaledH: number,
  originalWidth: number,
  originalHeight: number
): { maskData: Uint8Array; maskWidth: number; maskHeight: number } {
  // Step 1: Crop the inner (scaled image) region from the padded tensor
  const cropped = new Float32Array(scaledW * scaledH);
  for (let row = 0; row < scaledH; row++) {
    const srcRowStart = (padY + row) * tensorSize + padX;
    const dstRowStart = row * scaledW;
    for (let col = 0; col < scaledW; col++) {
      cropped[dstRowStart + col] = tensorData[srcRowStart + col];
    }
  }

  // Step 2: Find min/max for normalization
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < cropped.length; i++) {
    const v = cropped[i];
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }

  const range = maxVal - minVal;
  const threshold = range > 0 ? 0.3 : 0.5;

  // Step 3: Nearest-neighbor scale to original dimensions + threshold
  const result = new Uint8Array(originalWidth * originalHeight);
  const ratioX = scaledW / originalWidth;
  const ratioY = scaledH / originalHeight;

  for (let y = 0; y < originalHeight; y++) {
    const srcY = Math.min(scaledH - 1, Math.max(0, Math.round(y * ratioY)));
    const srcRowOffset = srcY * scaledW;
    const dstRowOffset = y * originalWidth;

    for (let x = 0; x < originalWidth; x++) {
      const srcX = Math.min(scaledW - 1, Math.max(0, Math.round(x * ratioX)));
      const val = cropped[srcRowOffset + srcX];
      let normalized = val;
      if (range > 0) {
        normalized = (val - minVal) / range;
      }
      result[dstRowOffset + x] = normalized > threshold ? 255 : 0;
    }
  }

  return { maskData: result, maskWidth: originalWidth, maskHeight: originalHeight };
}

// ─── Message Handler ─────────────────────────────────────────────────────────

// Worker hazır olduğunda kendini bildir
console.log('[SAM Polygon Worker] Worker initialized and ready');

self.onmessage = async (e: MessageEvent) => {
  const { type, data, requestId } = e.data;

  try {
    switch (type) {
      case 'PING': {
        self.postMessage({ type: 'PONG', requestId });
        break;
      }

      case 'MASK_TO_POLYGON': {
        const { maskData, width, height, epsilon = 1.0 } = data as {
          maskData: Uint8Array;
          width: number;
          height: number;
          epsilon: number;
        };

        console.log('[SAM Polygon Worker] MASK_TO_POLYGON started', { width, height, maskDataLength: maskData?.byteLength });

        if (!maskData || !width || !height || maskData.byteLength === 0) {
          self.postMessage({
            type: 'ERROR',
            requestId,
            data: { message: 'MASK_TO_POLYGON: maskData, width, and height are required.' },
          });
          return;
        }

        const coordinates = maskToPolygonImpl(maskData, width, height, epsilon);

        console.log('[SAM Polygon Worker] MASK_TO_POLYGON completed', { coordinateCount: coordinates.length });

        self.postMessage({
          type: 'POLYGON_RESULT',
          requestId,
          data: { coordinates },
        });
        break;
      }

      case 'MASK_TO_BLOB_URL': {
        const { maskData, width, height } = data as {
          maskData: Uint8Array;
          width: number;
          height: number;
        };

        if (!maskData || !width || !height) {
          self.postMessage({
            type: 'ERROR',
            requestId,
            data: { message: 'MASK_TO_BLOB_URL: maskData, width, and height are required.' },
          });
          return;
        }

        const blobUrl = await maskToBlobUrlImpl(maskData, width, height);

        self.postMessage({
          type: 'BLOB_URL_RESULT',
          requestId,
          data: { blobUrl },
        });
        break;
      }

      case 'CROP_SCALE_MASK': {
        const { tensorData, tensorSize, padX, padY, scaledW, scaledH, originalWidth, originalHeight } = data as {
          tensorData: Float32Array;
          tensorSize: number;
          padX: number;
          padY: number;
          scaledW: number;
          scaledH: number;
          originalWidth: number;
          originalHeight: number;
        };

        if (!tensorData || !tensorSize || originalWidth == null || originalHeight == null) {
          self.postMessage({
            type: 'ERROR',
            requestId,
            data: { message: 'CROP_SCALE_MASK: tensorData, tensorSize, originalWidth, and originalHeight are required.' },
          });
          return;
        }

        const result = cropAndScaleMaskImpl(
          tensorData, tensorSize, padX, padY, scaledW, scaledH,
          originalWidth, originalHeight
        );

        // Transfer the ArrayBuffer for efficiency
        const maskBuffer = result.maskData.buffer.slice(0) as ArrayBuffer;
        self.postMessage(
          {
            type: 'CROP_SCALE_RESULT',
            requestId,
            data: {
              maskData: maskBuffer,
              maskWidth: result.maskWidth,
              maskHeight: result.maskHeight,
            },
          },
          { transfer: [maskBuffer] }
        );
        break;
      }

      default:
        self.postMessage({
          type: 'ERROR',
          requestId,
          data: { message: `Unknown message type: ${type}` },
        });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    self.postMessage({
      type: 'ERROR',
      requestId,
      data: { message: errorMessage },
    });
  }
};
