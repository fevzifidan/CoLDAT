/**
 * samContour.ts
 *
 * Converts raw SAM decoder logits (low_res_masks, 256×256) to a simplified
 * polygon in original image coordinates using:
 *   • d3-contour — Marching squares threshold contour detection (sub-pixel)
 *   • simplify-js — Ramer-Douglas-Peucker polyline simplification
 *
 * ─── CRITICAL: Coordinate System ──────────────────────────────────────────
 *
 * low_res_masks is a [1, 1, 256, 256] tensor from the SAM decoder.
 * It is NOT directly mappable to original image space via a simple ratio.
 *
 * The 256×256 grid represents the FULL 1024×1024 padded tensor space,
 * where each grid cell = 4×4 pixels in 1024 space.
 * Like masks (1024×1024), low_res_masks includes the padding regions.
 *
 * Therefore the coordinate pipeline is:
 *
 *   256×256 grid → 1024×1024 (×4) → crop padding → original image space
 *
 * SamLogitData stores originalWidth and originalHeight so we can
 * compute the correct scaling chain here.
 *
 * ─── Coordinate Pipeline ──────────────────────────────────────────────────
 *
 *   SAM Decoder → low_res_masks [1,1,256,256] raw logits
 *        │
 *        ▼
 *   d3-contour(threshold=0.0) → GeoJSON MultiPolygon
 *        │  Contour points in [0, 256] range in 256×256 grid space
 *        │
 *        ▼
 *   Step 1: Scale up to 1024×1024 padded space (multiply by 4)
 *           gridPt * (1024 / 256) = gridPt * 4
 *        │
 *        ▼
 *   Step 2: Crop padding to get scaled-image-region coordinates
 *           imgX = paddedX - padX
 *           imgY = paddedY - padY
 *        │
 *        ▼
 *   Step 3: Scale from scaled-image-region to original image
 *           origX = imgX / scaleRatio
 *           origY = imgY / scaleRatio
 *        │
 *        ▼
 *   simplify-js (RDP algorithm, epsilon in image pixels)
 *        │
 *        ▼
 *   Flat array [x1, y1, x2, y2, ...] for Konva Line closed={true}
 */

import { contours } from 'd3-contour';
import simplify from 'simplify-js';

// ─── Constants ───────────────────────────────────────────────────────────────

/** MobileSAM's low_res_masks is fixed at 256×256 */
const LOW_RES_SIZE = 256;

/** MobileSAM's padded tensor size */
const TENSOR_SIZE = 1024;

// ─── Types ───────────────────────────────────────────────────────────────────

interface Point {
  x: number;
  y: number;
}

// ─── Main Function ───────────────────────────────────────────────────────────

/**
 * Convert raw SAM decoder logits (low_res_masks) to a simplified polygon.
 *
 * CRITICAL coordinate pipeline:
 *   low_res_masks [256×256] represents the full 1024×1024 padded tensor space.
 *   Each grid cell = 4×4 pixels in 1024 space.
 *
 *   Steps:
 *     1. d3-contour on 256×256 grid → contour points in [0, 256) range
 *     2. Scale to 1024 space: pt * (1024 / 256) = pt * 4
 *     3. Crop padding: (paddedX - padX, paddedY - padY)
 *     4. Scale to original image: cropped / scaleRatio
 *
 * @param logits       — Float32Array of raw logit values (256×256)
 * @param gridWidth    — Width of the logit grid (typically 256)
 * @param gridHeight   — Height of the logit grid (typically 256)
 * @param originalWidth  — Original image width in pixels
 * @param originalHeight — Original image height in pixels
 * @param padX         — Horizontal padding offset in 1024×1024 tensor
 * @param padY         — Vertical padding offset in 1024×1024 tensor
 * @param scaleRatio   — Scale ratio (tensorSize / max(originalWidth, originalHeight))
 * @param epsilon      — simplify-js tolerance in ORIGINAL IMAGE pixels (default: 2.0)
 * @returns Flat array [x1, y1, x2, y2, ...] for Konva Line, or null if no contour found
 */
export function logitsToPolygon(
  logits: Float32Array,
  gridWidth: number,
  gridHeight: number,
  originalWidth: number,
  originalHeight: number,
  padX: number,
  padY: number,
  scaleRatio: number,
  epsilon: number = 2.0
): number[] | null {
  // ── Validate inputs ───────────────────────────────────────────────────
  if (!logits || logits.length === 0) {
    console.warn('[SAM Contour] Empty logits array');
    return null;
  }

  if (logits.length < gridWidth * gridHeight) {
    console.warn(
      `[SAM Contour] Logits too small: ${logits.length} < ${gridWidth}×${gridHeight}`
    );
    return null;
  }

  // ── Step 1: d3-contour Marching Squares ──────────────────────────────
  // Threshold at 0.0: SAM sigmoid(logit) > 0.5 → mask pixel
  // d3-contour expects a 1D array viewable as gridWidth×gridHeight
  const contourGenerator = contours()
    .size([gridWidth, gridHeight])
    .thresholds([0.0])
    .smooth(false); // We handle smoothing via simplify-js

  // d3-contour accepts number[] or Float64Array; we pass as number[]
  const cells = Array.from(logits.subarray(0, gridWidth * gridHeight));
  const results = contourGenerator(cells);

  // ── Step 2: Select the best contour ─────────────────────────────────
  if (!results || results.length === 0) {
    return null;
  }

  // results[0] is the MultiPolygon geometry for the 0.0 threshold
  const feature = results[0];
  const multiPolygon = feature.coordinates as number[][][][];

  if (!multiPolygon || multiPolygon.length === 0) {
    return null;
  }

  // d3-contour does NOT sort polygons by area. It outputs them in scan order.
  // Calculate the area of each outer ring to find the largest mask component,
  // preventing tiny noise artifacts from being selected instead of the main object.
  let largestOuterRing: number[][] | null = null;
  let maxArea = -1;

  for (const polygon of multiPolygon) {
    const ring = polygon[0]; // Ring 0 is the exterior boundary
    if (!ring || ring.length < 3) continue;

    // Shoelace formula to calculate polygon area
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const [x1, y1] = ring[i];
      const [x2, y2] = ring[i + 1];
      area += (x1 * y2) - (x2 * y1);
    }
    area = Math.abs(area / 2);

    if (area > maxArea) {
      maxArea = area;
      largestOuterRing = ring;
    }
  }

  if (!largestOuterRing) {
    return null;
  }

  const outerRing = largestOuterRing;

  // ── Step 3: Coordinate transformation ───────────────────────────────
  // Chain: 256 grid → 1024 padded → crop padding → original image
  //
  //   gridX → paddedX = gridX * (TENSOR_SIZE / gridWidth)  (= gridX * 4)
  //   paddedX → croppedX = paddedX - padX
  //   croppedX → imgX = croppedX / scaleRatio
  //
  const upscaleToTensor = TENSOR_SIZE / gridWidth; // Always 4 for 256→1024

  const scaledPoints: Point[] = outerRing.map(
    ([x, y]: [number, number]) => {
      // Step 1: 256 grid → 1024 padded space
      const paddedX = x * upscaleToTensor;
      const paddedY = y * upscaleToTensor;

      // Step 2: Crop padding
      const croppedX = paddedX - padX;
      const croppedY = paddedY - padY;

      // Step 3: Scale to original image dimensions
      const imgX = croppedX / scaleRatio;
      const imgY = croppedY / scaleRatio;

      return { x: imgX, y: imgY };
    }
  );

  // ── Step 4: Ramer-Douglas-Peucker simplification ────────────────────
  // simplify-js eliminates points that are within `epsilon` distance
  // of the simplified line. Higher epsilon = fewer points.
  const simplified = simplify(scaledPoints, epsilon, false);

  // ── Step 5: Flatten to Konva format [x1, y1, x2, y2, ...] ─────────
  const flatCoords: number[] = [];
  for (const pt of simplified) {
    flatCoords.push(pt.x, pt.y);
  }

  console.log(
    `[SAM Contour] Polygon: ${outerRing.length} pts → ${simplified.length} pts (RDP ε=${epsilon})`
  );

  return flatCoords;
}

/**
 * Alternative entry point that accepts the raw decoder results and
 * handles grid dimension detection automatically.
 *
 * @param logits     — Float32Array from low_res_masks (first channel, flat)
 * @param logitCount — Total number of logit values (e.g., 256*256 = 65536)
 * @param originalWidth  — Original image width
 * @param originalHeight — Original image height
 * @param padX      — Horizontal padding in 1024 tensor
 * @param padY      — Vertical padding in 1024 tensor
 * @param scaleRatio — Scale ratio from original to tensor
 * @param epsilon    — simplify-js tolerance
 * @returns Same as logitsToPolygon
 */
export function lowResMasksToPolygon(
  logits: Float32Array,
  logitCount: number,
  originalWidth: number,
  originalHeight: number,
  padX: number,
  padY: number,
  scaleRatio: number,
  epsilon: number = 2.0
): number[] | null {
  // Determine grid dimensions — always 256×256 for MobileSAM
  const gridSize = Math.round(Math.sqrt(logitCount));
  if (gridSize * gridSize !== logitCount) {
    console.warn('[SAM Contour] Non-square logit grid:', logitCount);
    return null;
  }

  return logitsToPolygon(
    logits,
    gridSize,
    gridSize,
    originalWidth,
    originalHeight,
    padX,
    padY,
    scaleRatio,
    epsilon
  );
}
