/**
 * samCoords.ts
 *
 * Coordinate transformation utilities for MobileSAM's 1024×1024 tensor space.
 *
 * MobileSAM requires a square 1024×1024 input. Images of any aspect ratio
 * must be processed using "longest-edge resizing" (no stretching) with
 * zero-padding to fill the remaining area.
 *
 * ─── Visual representation ────────────────────────────────────────────
 *  1024 ┌──────────────────────────────────────┐
 *       │          Zero Padding (top)           │
 *       │    ┌─────────────────────────┐        │
 *       │    │                         │        │
 *       │ P  │   Scaled Image          │  P     │
 *       │ A  │   (maintains ratio)     │  A     │
 *       │ D  │                         │  D     │
 *       │    └─────────────────────────┘        │
 *       │        Zero Padding (bottom)          │
 *      0 └──────────────────────────────────────┘
 *      0                 1024
 *
 * Usage:
 *   const dims = getScaledDims(1920, 1080, 1024);
 *   // { width: 1024, height: 576, padX: 0, padY: 224, scaleRatio: 0.5333 }
 *
 *   const modelClick = mapClickToModel(450, 300, 1920, 1080, 1024);
 *   // { x: 240, y: 384 } — click mapped into padded tensor
 *
 *   const result = cropAndScaleMask(tensorData, 1024, 1920, 1080, 1024);
 *   // { maskData: Uint8Array(1920*1080), maskWidth: 1920, maskHeight: 1080 }
 */

// ─── Constants ───────────────────────────────────────────────────────────────

/** MobileSAM's fixed input/output tensor size */
export const SAM_TENSOR_SIZE = 1024;

// ─── Scaled Dimensions (Preprocessing Helper) ────────────────────────────────

/**
 * Compute the scale ratio: how much to shrink the longest edge to fit targetSize.
 *
 * scaleRatio = targetSize / max(originalWidth, originalHeight)
 *
 * For a 1920×1080 image (aspect ratio 16:9):
 *   scaleRatio = 1024 / 1920 ≈ 0.5333
 *   scaledWidth  = 1920 * 0.5333 = 1024
 *   scaledHeight = 1080 * 0.5333 ≈ 576
 *
 * @param originalWidth  — Image width in pixels
 * @param originalHeight — Image height in pixels
 * @param targetSize     — Target tensor size (default: 1024)
 * @returns The scale ratio (always ≤ 1 for images ≥ targetSize on the longest edge)
 */
export function getScaleRatio(
  originalWidth: number,
  originalHeight: number,
  targetSize: number = SAM_TENSOR_SIZE
): number {
  if (originalWidth <= 0 || originalHeight <= 0 || targetSize <= 0) {
    return 1; // No scaling possible, treat as identity
  }
  return targetSize / Math.max(originalWidth, originalHeight);
}

/**
 * Return all derived values for the padding/layout in a single call.
 *
 * This is the primary preprocessing helper — call this before:
 *   - Creating an OffscreenCanvas for the worker
 *   - Mapping click coordinates to model space
 *   - Cropping/scaling mask outputs back
 *
 * @param originalWidth  — Image width in pixels
 * @param originalHeight — Image height in pixels
 * @param targetSize     — Target tensor size (default: 1024)
 * @returns
 *   - width, height:   Scaled integer dimensions (maintains aspect ratio)
 *   - padX, padY:      Left/top offsets for centering the image in the tensor
 *   - scaleRatio:      The ratio used (for back-mapping)
 */
export function getScaledDims(
  originalWidth: number,
  originalHeight: number,
  targetSize: number = SAM_TENSOR_SIZE
): {
  width: number;
  height: number;
  padX: number;
  padY: number;
  scaleRatio: number;
} {
  const scaleRatio = getScaleRatio(originalWidth, originalHeight, targetSize);

  const width = Math.round(originalWidth * scaleRatio);
  const height = Math.round(originalHeight * scaleRatio);

  // Centering padding — floor ensures even distribution
  const padX = Math.floor((targetSize - width) / 2);
  const padY = Math.floor((targetSize - height) / 2);

  return { width, height, padX, padY, scaleRatio };
}

// ─── Click → Model Coordinates (Send to Worker) ─────────────────────────────

/**
 * Convert a click coordinate in the original image space into the
 * 1024×1024 padded tensor space.
 *
 * Formula:
 *   modelX = (clickX * scaleRatio) + padX
 *   modelY = (clickY * scaleRatio) + padY
 *
 * @param clickX        — X coordinate in original image pixels
 * @param clickY        — Y coordinate in original image pixels
 * @param originalWidth — Image width in pixels
 * @param originalHeight— Image height in pixels
 * @param targetSize    — Target tensor size (default: 1024)
 * @returns
 *   { x, y } in the padded 1024×1024 tensor, or null if click is out of bounds
 */
export function mapClickToModel(
  clickX: number,
  clickY: number,
  originalWidth: number,
  originalHeight: number,
  targetSize: number = SAM_TENSOR_SIZE
): { x: number; y: number } | null {
  // Bounds check — clicks outside the image are invalid
  if (
    clickX < 0 ||
    clickX > originalWidth ||
    clickY < 0 ||
    clickY > originalHeight
  ) {
    return null;
  }

  const { padX, padY, scaleRatio } = getScaledDims(
    originalWidth,
    originalHeight,
    targetSize
  );

  const modelX = clickX * scaleRatio + padX;
  const modelY = clickY * scaleRatio + padY;

  // Clamp to [0, targetSize - 1] to avoid out-of-bounds tensor access
  return {
    x: Math.max(0, Math.min(targetSize - 1, Math.round(modelX))),
    y: Math.max(0, Math.min(targetSize - 1, Math.round(modelY))),
  };
}

// ─── Model Output → Image Space (From Worker Response) ──────────────────────

/**
 * Crop the padding from the model's 1024×1024 mask output and scale it back
 * to the original image dimensions for pixel-perfect Konva rendering.
 *
 * Algorithm:
 *   1. Extract the inner rectangle (scaled image region) from the padded tensor
 *   2. Nearest-neighbor scale the cropped region back to original dimensions
 *   3. Threshold the result (> 0.5 becomes 255, ≤ 0.5 becomes 0)
 *
 * @param tensorData    — Flat Float32Array of size tensorSize² from the decoder output
 * @param tensorSize    — The width/height of the square tensor (default: 1024)
 * @param originalWidth — Original image width (intended output mask width)
 * @param originalHeight— Original image height (intended output mask height)
 * @param targetSize    — Must match the size used during preprocessing (default: 1024)
 * @returns
 *   - maskData:  Uint8Array of size originalWidth × originalHeight
 *                Each cell is 0 (background) or 255 (mask)
 *   - maskWidth: originalWidth
 *   - maskHeight: originalHeight
 */
export function cropAndScaleMask(
  tensorData: Float32Array,
  tensorSize: number,
  originalWidth: number,
  originalHeight: number,
  targetSize: number = SAM_TENSOR_SIZE
): { maskData: Uint8Array; maskWidth: number; maskHeight: number } {
  // The model output may be non-square (e.g., [1,1,1200,1920]).
  // Determine actual dimensions: either tensorSize x tensorSize (square)
  // or the tensor may be rectangular where tensorSize was the max dim.
  let actualW: number;
  let actualH: number;
  
  // If tensorData length doesn't match tensorSize^2, it's probably rectangular
  const squareSize = tensorSize * tensorSize;
  if (tensorData.length === squareSize) {
    // Square tensor — use original logic with getScaledDims
    actualW = tensorSize;
    actualH = tensorSize;
  } else {
    // Rectangular tensor — try to determine dims from original image ratio
    // Assume tensorSize is the max dimension and the other dim is proportional
    const ratio = originalWidth / originalHeight;
    if (originalWidth >= originalHeight) {
      actualW = tensorSize;
      actualH = Math.round(tensorSize / ratio);
    } else {
      actualH = tensorSize;
      actualW = Math.round(tensorSize * ratio);
    }
    // Verify: if the estimated dims don't match, try swapping
    if (actualW * actualH !== tensorData.length) {
      // Try swapped
      if (originalHeight >= originalWidth) {
        actualW = Math.round(tensorSize / ratio);
        actualH = tensorSize;
      } else {
        actualH = Math.round(tensorSize / ratio);
        actualW = tensorSize;
      }
    }
  }

  // If dimensions don't match, return empty mask
  if (tensorData.length < actualW * actualH) {
    console.warn(
      `[SAM Coords] tensorData too small: ${tensorData.length} < ${actualW * actualH}. Returning empty mask.`
    );
    return {
      maskData: new Uint8Array(originalWidth * originalHeight),
      maskWidth: originalWidth,
      maskHeight: originalHeight,
    };
  }

  // ── Step 1: If tensor has padding, crop it. Otherwise use as-is. ──
  const { width: scaledW, height: scaledH, padX, padY } = getScaledDims(
    originalWidth,
    originalHeight,
    targetSize
  );

  let cropped: Float32Array;
  
  if (actualW === tensorSize && actualH === tensorSize && (padX > 0 || padY > 0)) {
    // Square tensor with padding — crop the inner region
    cropped = new Float32Array(scaledW * scaledH);
    for (let row = 0; row < scaledH; row++) {
      const srcRowStart = (padY + row) * tensorSize + padX;
      const dstRowStart = row * scaledW;
      for (let col = 0; col < scaledW; col++) {
        cropped[dstRowStart + col] = tensorData[srcRowStart + col];
      }
    }
  } else if (actualW === originalWidth && actualH === originalHeight) {
    // Model output is already at original resolution — no crop/scale needed
    cropped = tensorData;
  } else if (actualW === scaledW && actualH === scaledH) {
    // Model output is at scaled (pre-padding) resolution — no crop needed
    cropped = tensorData;
  } else {
    // Unknown layout — use raw tensor data as-is and scale to original
    cropped = tensorData;
  }

  // ── Step 2: Nearest-neighbor scale to original dimensions ──
  const result = new Uint8Array(originalWidth * originalHeight);
  
  // Determine the effective cropped dimensions
  const cropW = (actualW === tensorSize && actualH === tensorSize) ? scaledW : actualW;
  const cropH = (actualH === tensorSize && actualW === tensorSize) ? scaledH : actualH;
  
  // Use original resolution directly if cropped matches original
  if (cropped.length === originalWidth * originalHeight) {
    // Already at original resolution — just threshold
    for (let i = 0; i < cropped.length; i++) {
      result[i] = cropped[i] > 0.0 ? 255 : 0;
    }
    return { maskData: result, maskWidth: originalWidth, maskHeight: originalHeight };
  }

  // First, find the min and max of the cropped region to normalize
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < cropped.length; i++) {
    const v = cropped[i];
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }

  const range = maxVal - minVal;
  const threshold = range > 0 ? 0.3 : 0.5; // Adaptive threshold or fallback

  const ratioX = cropW / originalWidth;
  const ratioY = cropH / originalHeight;

  for (let y = 0; y < originalHeight; y++) {
    const srcY = Math.min(cropH - 1, Math.max(0, Math.round(y * ratioY)));
    const srcRowOffset = srcY * cropW;
    const dstRowOffset = y * originalWidth;

    for (let x = 0; x < originalWidth; x++) {
      const srcX = Math.min(cropW - 1, Math.max(0, Math.round(x * ratioX)));
      const val = cropped[srcRowOffset + srcX];
      // Normalize if range is valid, then threshold
      let normalized = val;
      if (range > 0) {
        normalized = (val - minVal) / range;
      }
      result[dstRowOffset + x] = normalized > threshold ? 255 : 0;
    }
  }

  return {
    maskData: result,
    maskWidth: originalWidth,
    maskHeight: originalHeight,
  };
}

// ─── Model Coordinates → Image Space (For Display) ─────────────────────────

/**
 * Convert a coordinate from the 1024×1024 padded model space back to the
 * original image pixel space. Useful for rendering debug overlays or
 * back-translating model outputs.
 *
 * @param modelX        — X coordinate in padded tensor space
 * @param modelY        — Y coordinate in padded tensor space
 * @param originalWidth — Image width in pixels
 * @param originalHeight— Image height in pixels
 * @param targetSize    — Target tensor size (default: 1024)
 * @returns
 *   { x, y } in original image coordinates, or null if in the padding region
 */
export function mapModelToImage(
  modelX: number,
  modelY: number,
  originalWidth: number,
  originalHeight: number,
  targetSize: number = SAM_TENSOR_SIZE
): { x: number; y: number } | null {
  const { padX, padY, scaleRatio } = getScaledDims(
    originalWidth,
    originalHeight,
    targetSize
  );

  // Check if the point falls in the padding region
  if (modelX < padX || modelX >= padX + Math.round(originalWidth * scaleRatio)) {
    return null;
  }
  if (modelY < padY || modelY >= padY + Math.round(originalHeight * scaleRatio)) {
    return null;
  }

  if (scaleRatio === 0) return null;

  const imgX = (modelX - padX) / scaleRatio;
  const imgY = (modelY - padY) / scaleRatio;

  return {
    x: Math.max(0, Math.min(originalWidth, imgX)),
    y: Math.max(0, Math.min(originalHeight, imgY)),
  };
}

// ─── Mask to Polygon Conversion ────────────────────────────────────────────

/**
 * Direction vectors for Moore-Neighbor contour tracing.
 * Order: right, down-right, down, down-left, left, up-left, up, up-right
 */
const DIRS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1],
  [-1, 0], [-1, -1], [0, -1], [1, -1],
];

/**
 * Convert a binary mask (Uint8Array) to a polygon by finding the outer contour.
 *
 * Uses Moore-Neighbor tracing algorithm with Jacob's stopping criterion.
 * The resulting polygon is simplified using the Douglas-Peucker algorithm
 * to reduce the number of points.
 *
 * @param maskData  — Flat Uint8Array of size width × height (0 = background, >0 = mask)
 * @param width     — Width of the mask in pixels
 * @param height    — Height of the mask in pixels
 * @param epsilon   — Douglas-Peucker simplification factor (higher = fewer points, default 1.0)
 * @returns
 *   Array of [x, y] coordinate pairs forming the outer contour,
 *   or an empty array if no contour is found.
 */
export function maskToPolygon(
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

  // ── Step 2: Moore-Neighbor contour tracing ─────────────────────────────
  const contour: [number, number][] = [];
  let currentX = startX;
  let currentY = startY;
  let prevDir = 6; // Start searching from direction 6 (up)
  
  // Helper: check if a pixel is foreground (in bounds)
  const isForeground = (px: number, py: number): boolean => {
    if (px < 0 || px >= width || py < 0 || py >= height) return false;
    return maskData[py * width + px] > 0;
  };

  do {
    contour.push([currentX, currentY]);

    // Search for the next boundary pixel starting from prevDir+1 (counter-clockwise)
    let found = false;
    let startSearchDir = (prevDir + 1) % 8;
    
    for (let i = 0; i < 8; i++) {
      const dirIdx = (startSearchDir + i) % 8;
      const [dx, dy] = DIRS[dirIdx];
      const nx = currentX + dx;
      const ny = currentY + dy;
      
      if (isForeground(nx, ny)) {
        // Move to the next boundary pixel
        currentX = nx;
        currentY = ny;
        prevDir = dirIdx;
        found = true;
        break;
      }
    }

    if (!found) {
      // Isolated pixel — just return the single point
      break;
    }

    // Jacob's stopping criterion: stop when we return to the start
    // AND the previous direction matches the initial direction
    if (currentX === startX && currentY === startY && prevDir === 6) {
      break;
    }
  } while (contour.length < width * height); // Safety limit

  // ── Step 3: Simplify using Douglas-Peucker algorithm ───────────────────
  if (contour.length <= 2) return contour.flat();

  const simplified = simplifyPolygon(contour, epsilon);
  return simplified.flat();
}

/**
 * Douglas-Peucker polygon simplification algorithm.
 * Reduces the number of points in a polyline while preserving shape.
 *
 * @param points  — Array of [x, y] coordinate pairs
 * @param epsilon — Maximum distance tolerance (higher = fewer points)
 * @returns Simplified array of [x, y] pairs
 */
function simplifyPolygon(
  points: [number, number][],
  epsilon: number
): [number, number][] {
  if (points.length <= 2) return points;

  // Find the point with maximum distance from the line between first and last
  let maxDist = 0;
  let maxIdx = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }

  // If max distance is greater than epsilon, recursively simplify
  if (maxDist > epsilon) {
    const left = simplifyPolygon(points.slice(0, maxIdx + 1), epsilon);
    const right = simplifyPolygon(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

/**
 * Perpendicular distance from a point to a line segment.
 */
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
    // Line is a point
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}
