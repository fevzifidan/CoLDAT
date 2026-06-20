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
 * CORE FIX (2025):
 *   - The worker always uses orig_im_size=[1024,1024] for performance.
 *   - Output is a square 1024×1024 tensor containing the padded image.
 *   - This function crops the inner (scaled image) region from padding,
 *     thresholds at logit > 0.0 (sigmoid-equivalent), and scales to original dims.
 *   - NO min/max normalization is applied — SAM outputs raw logits.
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
  // ── Step 0: Determine actual tensor dimensions ──────────────────────────
  // The worker always uses orig_im_size=[1024,1024], so output is 1024×1024.
  let actualW: number;
  let actualH: number;

  if (tensorData.length === tensorSize * tensorSize) {
    // Standard case: square tensor (1024×1024 = 1,048,576 elements)
    actualW = tensorSize;
    actualH = tensorSize;
  } else {
    // Non-square output — try to detect dimensions
    const totalPixels = tensorData.length;
    let found = false;
    for (let w = tensorSize; w >= 1; w--) {
      if (totalPixels % w === 0) {
        const h = totalPixels / w;
        if (Number.isInteger(h) && h <= tensorSize) {
          actualW = w;
          actualH = h;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      actualW = originalWidth;
      actualH = originalHeight;
    }
  }

  // Sanity check
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

  // ── Step 1: Compute scaled dimensions and padding ──────────────────────
  const { width: scaledW, height: scaledH, padX, padY } = getScaledDims(
    originalWidth,
    originalHeight,
    targetSize
  );

  // ── Step 2: Crop the inner (scaled image) region from the padded tensor ─
  let cropped: Float32Array;
  let cropW: number;
  let cropH: number;

  if (actualW === targetSize && actualH === targetSize) {
    // Standard padded tensor — crop out the padding to get the inner region
    cropped = new Float32Array(scaledW * scaledH);
    for (let row = 0; row < scaledH; row++) {
      const srcRowStart = (padY + row) * targetSize + padX;
      const dstRowStart = row * scaledW;
      for (let col = 0; col < scaledW; col++) {
        cropped[dstRowStart + col] = tensorData[srcRowStart + col];
      }
    }
    cropW = scaledW;
    cropH = scaledH;
  } else {
    // Non-square output — use as-is
    cropped = tensorData.subarray(0, actualW * actualH);
    cropW = actualW;
    cropH = actualH;
  }

  // ── Step 3: Determine threshold ────────────────────────────────────────
  // SAM decoder outputs raw logits. sigmoid(0) = 0.5, so logit > 0 → mask.
  // This is the correct threshold for SAM logits.
  // Scan CROPPED region only (not padding) for edge case detection.
  let threshold: number;
  let positiveCount = 0;
  let negativeCount = 0;

  for (let i = 0; i < cropped.length; i++) {
    if (cropped[i] > 0) positiveCount++;
    else negativeCount++;
  }

  if (positiveCount === 0) {
    // All logits negative — no mask detected
    return {
      maskData: new Uint8Array(originalWidth * originalHeight),
      maskWidth: originalWidth,
      maskHeight: originalHeight,
    };
  } else if (negativeCount === 0) {
    // All logits positive — model very confident. Use median as threshold.
    const sorted = new Float32Array(cropped);
    sorted.sort();
    threshold = sorted[Math.floor(sorted.length * 0.5)];
    console.log(
      `[SAM Coords] All logits positive! Using median adaptive threshold: ${threshold.toFixed(4)}`
    );
  } else {
    // Normal case: mixed positive/negative logits → threshold at 0.0
    threshold = 0.0;
  }

  // ── Step 4: Nearest-neighbor scale to original dimensions ─────────────
  const result = new Uint8Array(originalWidth * originalHeight);

  // Fast path: already at original resolution
  if (cropW === originalWidth && cropH === originalHeight) {
    for (let i = 0; i < cropped.length; i++) {
      result[i] = cropped[i] > threshold ? 255 : 0;
    }
    return { maskData: result, maskWidth: originalWidth, maskHeight: originalHeight };
  }

  // Nearest-neighbor interpolation
  const ratioX = cropW / originalWidth;
  const ratioY = cropH / originalHeight;

  for (let y = 0; y < originalHeight; y++) {
    const srcY = Math.min(cropH - 1, Math.max(0, Math.round(y * ratioY)));
    const srcRowOffset = srcY * cropW;
    const dstRowOffset = y * originalWidth;

    for (let x = 0; x < originalWidth; x++) {
      const srcX = Math.min(cropW - 1, Math.max(0, Math.round(x * ratioX)));
      const val = cropped[srcRowOffset + srcX];
      result[dstRowOffset + x] = val > threshold ? 255 : 0;
    }
  }

  return {
    maskData: result,
    maskWidth: originalWidth,
    maskHeight: originalHeight,
  };
}

// ─── Mask to Bounding Box Conversion ──────────────────────────────────────

/**
 * Convert a binary mask (Uint8Array) to a bounding box by finding the
 * minimum and maximum foreground pixel coordinates.
 *
 * This is useful for:
 *   - Committing a SAM mask as a bounding box annotation (Enter key)
 *   - Exporting masks in YOLO/COCO bbox format
 *   - Measuring object extent within the mask
 *
 * @param maskData  — Flat Uint8Array of size width × height (0 = background, >0 = mask)
 * @param width     — Width of the mask in pixels
 * @param height    — Height of the mask in pixels
 * @returns
 *   { xMin, yMin, xMax, yMax } in pixel coordinates,
 *   or null if no foreground pixels are found.
 */
export function maskToBoundingBox(
  maskData: Uint8Array,
  width: number,
  height: number
): { xMin: number; yMin: number; xMax: number; yMax: number } | null {
  let xMin = width;
  let yMin = height;
  let xMax = 0;
  let yMax = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      if (maskData[rowOffset + x] > 0) {
        found = true;
        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
    }
  }

  if (!found) return null;

  return { xMin, yMin, xMax, yMax };
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

// ─── BBox → Model Coordinates (For SAM Decoder) ────────────────────────────

/**
 * Convert a bounding box from image pixel coordinates to model (1024×1024)
 * padded tensor space. Both corners of the bbox are independently mapped
 * using mapClickToModel, ensuring the box remains axis-aligned.
 *
 * @param x1             — Left (or right) X in original image pixels
 * @param y1             — Top (or bottom) Y in original image pixels
 * @param x2             — Opposite corner X
 * @param y2             — Opposite corner Y
 * @param originalWidth  — Image width in pixels
 * @param originalHeight — Image height in pixels
 * @param targetSize     — Target tensor size (default: 1024)
 * @returns
 *   Normalized bbox { x1, y1, x2, y2 } with x1<x2 and y1<y2 in model space,
 *   or null if either corner is out of bounds.
 */
export function mapBboxToModel(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  originalWidth: number,
  originalHeight: number,
  targetSize: number = SAM_TENSOR_SIZE
): { x1: number; y1: number; x2: number; y2: number } | null {
  // Normalize: ensure x1<x2 and y1<y2
  const nx1 = Math.min(x1, x2);
  const ny1 = Math.min(y1, y2);
  const nx2 = Math.max(x1, x2);
  const ny2 = Math.max(y1, y2);

  const topLeft = mapClickToModel(nx1, ny1, originalWidth, originalHeight, targetSize);
  const bottomRight = mapClickToModel(nx2, ny2, originalWidth, originalHeight, targetSize);

  if (!topLeft || !bottomRight) return null;

  return {
    x1: topLeft.x,
    y1: topLeft.y,
    x2: bottomRight.x,
    y2: bottomRight.y,
  };
}
