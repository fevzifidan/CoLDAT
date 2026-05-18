/**
 * Priority Queue (Min-Heap) implementation for A*
 */
class PriorityQueue<T> {
  private heap: { priority: number; value: T }[] = [];

  push(value: T, priority: number) {
    this.heap.push({ priority, value });
    this.bubbleUp();
  }

  pop(): T | undefined {
    if (this.size() === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.size() > 0) {
      this.heap[0] = last;
      this.bubbleDown();
    }
    return top.value;
  }

  size() { return this.heap.length; }
  clear() { this.heap = []; }

  private bubbleUp() {
    let index = this.heap.length - 1;
    const element = this.heap[index];
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      let parent = this.heap[parentIndex];
      if (element.priority >= parent.priority) break;
      this.heap[index] = parent;
      index = parentIndex;
    }
    this.heap[index] = element;
  }

  private bubbleDown() {
    let index = 0;
    const length = this.heap.length;
    const element = this.heap[0];
    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIndex < length) {
        leftChild = this.heap[leftChildIndex];
        if (leftChild.priority < element.priority) swap = leftChildIndex;
      }

      if (rightChildIndex < length) {
        rightChild = this.heap[rightChildIndex];
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null && rightChild.priority < (leftChild as any).priority)
        ) {
          swap = rightChildIndex;
        }
      }

      if (swap === null) break;
      this.heap[index] = this.heap[swap];
      index = swap;
    }
    this.heap[index] = element;
  }
}

interface Point {
  x: number;
  y: number;
}

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// ─── Global state (tüm resim) ───────────────────────────────────────────────
let costMap: Float32Array | null = null;
let gradX: Float32Array | null = null;
let gradY: Float32Array | null = null;
let laplacian: Float32Array | null = null;
let magnitude: Float32Array | null = null;
let maxMag = 0;
let width = 0;
let height = 0;
let robustMaxMag = 0;

// ─── Pathfinding state (incremental) ─────────────────────────────────────────
let dist: Float32Array;
let prev: Int32Array;
let visited: Uint8Array;
let lastSeedIdx = -1;
let pq = new PriorityQueue<number>();
let dirtyIndices: Int32Array;
let dirtyCount = 0;
let lastBounds: Bounds | null = null;

// ─── SUB-PIXEL YARDIMCILARI ─────────────────────────────────────────────────

function sampleBilinear(arr: Float32Array, x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  if (x0 < 0 || x1 >= width || y0 < 0 || y1 >= height) {
    const cx = Math.max(0, Math.min(width - 1, Math.round(x)));
    const cy = Math.max(0, Math.min(height - 1, Math.round(y)));
    return arr[cy * width + cx];
  }

  const fx = x - x0;
  const fy = y - y0;

  const c00 = arr[y0 * width + x0];
  const c10 = arr[y0 * width + x1];
  const c01 = arr[y1 * width + x0];
  const c11 = arr[y1 * width + x1];

  const row0 = c00 + fx * (c10 - c00);
  const row1 = c01 + fx * (c11 - c01);
  return row0 + fy * (row1 - row0);
}

function getCostSubPixel(x: number, y: number): number {
  if (!costMap) return 1.0;
  return sampleBilinear(costMap, x, y);
}

function getGradMagSubPixel(x: number, y: number): number {
  if (!gradX || !gradY) return 0;
  const gx = sampleBilinear(gradX, x, y);
  const gy = sampleBilinear(gradY, x, y);
  return Math.sqrt(gx * gx + gy * gy);
}

function getLaplacianSubPixel(x: number, y: number): number {
  if (!laplacian) return 0;
  return sampleBilinear(laplacian, x, y);
}

/**
 * Zero-crossing refinement: p1 ve p2 arasında laplacian işaret değişiyorsa
 * tam geçiş noktasını lineer interpolasyonla bul.
 */
function refineZeroCrossing(p1: Point, p2: Point): Point | null {
  if (!laplacian) return null;
  
  const l1 = getLaplacianSubPixel(p1.x, p1.y);
  const l2 = getLaplacianSubPixel(p2.x, p2.y);
  
  if (Math.sign(l1) === Math.sign(l2) || Math.abs(l1 - l2) < 0.001) return null;
  
  const t = -l1 / (l2 - l1);
  if (t < 0 || t > 1) return null;
  
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  };
}

/**
 * Path boyunca zero-crossing refinement uygula.
 */
function applyZeroCrossingRefinement(points: number[]): number[] {
  if (points.length < 4) return points;
  
  const refined: number[] = [];
  
  for (let i = 0; i < points.length - 2; i += 2) {
    const p1: Point = { x: points[i], y: points[i + 1] };
    const p2: Point = { x: points[i + 2], y: points[i + 3] };
    
    if (i === 0) {
      refined.push(p1.x, p1.y);
    }
    
    const zc = refineZeroCrossing(p1, p2);
    if (zc) {
      refined.push(zc.x, zc.y);
    } else {
      refined.push(p2.x, p2.y);
    }
  }
  
  return refined;
}

// ─── A* heuristic ───────────────────────────────────────────────────────────

function heuristic(idx: number, targetIdx: number): number {
  const x1 = idx % width;
  const y1 = Math.floor(idx / width);
  const x2 = targetIdx % width;
  const y2 = Math.floor(targetIdx / width);
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ─── INIT ────────────────────────────────────────────────────────────────────

function init(imageData: Uint8ClampedArray, w: number, h: number) {
  width = w;
  height = h;
  const size = w * h;
  
  dist = new Float32Array(size).fill(Infinity);
  prev = new Int32Array(size).fill(-1);
  visited = new Uint8Array(size).fill(0);
  dirtyIndices = new Int32Array(size);
  dirtyCount = 0;
  lastSeedIdx = -1;
  lastBounds = null;
  pq.clear();

  const grayscale = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    grayscale[i] = 0.299 * imageData[i * 4] + 0.587 * imageData[i * 4 + 1] + 0.114 * imageData[i * 4 + 2];
  }

  const blurred = new Float32Array(size);
  const K = [0.05, 0.1, 0.05, 0.1, 0.4, 0.1, 0.05, 0.1, 0.05];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let s = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          s += grayscale[(y + ky) * w + (x + kx)] * K[(ky + 1) * 3 + (kx + 1)];
        }
      }
      blurred[y * w + x] = s;
    }
  }

  gradX = new Float32Array(size);
  gradY = new Float32Array(size);
  laplacian = new Float32Array(size);
  magnitude = new Float32Array(size);
  maxMag = 0;

  const Gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const Gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const Lap = [0, 1, 0, 1, -4, 1, 0, 1, 0];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0, gy = 0, lap = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const val = blurred[(y + ky) * w + (x + kx)];
          const kIdx = (ky + 1) * 3 + (kx + 1);
          gx += val * Gx[kIdx];
          gy += val * Gy[kIdx];
          lap += val * Lap[kIdx];
        }
      }
      const idx = y * w + x;
      gradX[idx] = gx;
      gradY[idx] = gy;
      laplacian[idx] = lap;
      magnitude[idx] = Math.sqrt(gx * gx + gy * gy);
      if (magnitude[idx] > maxMag) maxMag = magnitude[idx];
    }
  }

  costMap = new Float32Array(size);
  robustMaxMag = maxMag * 0.8;
  
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const normMag = robustMaxMag > 0 ? Math.min(1.0, magnitude[idx] / robustMaxMag) : 0;
      const fz = Math.pow(1.0 - normMag, 6);
      const fl = (magnitude[idx] > maxMag * 0.05 && Math.abs(laplacian[idx]) < 1.5) ? 0 : 0.15;
      costMap[idx] = fz + fl;
    }
  }
  
  for (let x = 0; x < w; x++) {
    costMap[x] = 1.0;
    costMap[(h-1) * w + x] = 1.0;
  }
  for (let y = 0; y < h; y++) {
    costMap[y * w] = 1.0;
    costMap[y * w + (w-1)] = 1.0;
  }
}

// ─── ROI değişim kontrolü ───────────────────────────────────────────────────

function shouldResetForBounds(newBounds: Bounds): boolean {
  if (!lastBounds) return true;
  const oldW = lastBounds.maxX - lastBounds.minX;
  const oldH = lastBounds.maxY - lastBounds.minY;
  const newW = newBounds.maxX - newBounds.minX;
  const newH = newBounds.maxY - newBounds.minY;
  if (newW < oldW * 0.8 || newH < oldH * 0.8) return true;
  return false;
}

// ─── A* PATHFINDING (sub-pixel cost ile) ────────────────────────────────────

function findPath(seed: Point, target: Point, bounds?: Bounds): { points: number[]; totalCost: number } {
  if (!costMap || !gradX || !gradY || !laplacian) return { points: [], totalCost: 0 };

  const startIdx = Math.floor(seed.y) * width + Math.floor(seed.x);
  const targetIdx = Math.floor(target.y) * width + Math.floor(target.x);

  if (startIdx < 0 || startIdx >= width * height || targetIdx < 0 || targetIdx >= width * height) {
    return { points: [], totalCost: 0 };
  }

  const b = bounds || { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1 };

  if (bounds && shouldResetForBounds(b)) {
    for (let i = 0; i < dirtyCount; i++) {
      const idx = dirtyIndices[i];
      dist[idx] = Infinity;
      prev[idx] = -1;
      visited[idx] = 0;
    }
    dirtyCount = 0;
    pq.clear();
    lastSeedIdx = -1;
  }
  lastBounds = bounds ? { ...b } : null;

  if (startIdx !== lastSeedIdx) {
    for (let i = 0; i < dirtyCount; i++) {
      const idx = dirtyIndices[i];
      dist[idx] = Infinity;
      prev[idx] = -1;
      visited[idx] = 0;
    }
    dirtyCount = 0;
    pq.clear();
    dist[startIdx] = 0;
    pq.push(startIdx, 0);
    lastSeedIdx = startIdx;
    dirtyIndices[dirtyCount++] = startIdx;
  }

  if (!visited[targetIdx]) {
    while (pq.size() > 0) {
      const curr = pq.pop()!;
      if (visited[curr]) continue;
      visited[curr] = 1;
      if (curr === targetIdx) break;

      const cx = curr % width;
      const cy = Math.floor(curr / width);

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;

          const nx = cx + dx;
          const ny = cy + dy;

          if (nx < b.minX || nx > b.maxX || ny < b.minY || ny > b.maxY) continue;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

          const nextIdx = ny * width + nx;
          if (visited[nextIdx]) continue;

          const weight = (dx !== 0 && dy !== 0) ? 1.414 : 1.0;

          const midX = cx + dx * 0.5;
          const midY = cy + dy * 0.5;

          const magVal = getGradMagSubPixel(midX, midY);
          const normMag = robustMaxMag > 0 ? Math.min(1.0, magVal / robustMaxMag) : 0;
          const baseCost = Math.pow(1.0 - normMag, 6);

          let fd = 0;
          if (magVal > 0.1) {
            const gx = sampleBilinear(gradX!, midX, midY) / magVal;
            const gy = sampleBilinear(gradY!, midX, midY) / magVal; // Fixed: was midY, midY - now correctly midX, midY
            const lx = dx / weight;
            const ly = dy / weight;
            fd = 1.0 - Math.abs(lx * gx + ly * gy);
          }

          let fzc = 0;
          if (dx !== 0 && dy !== 0) {
            const lapHere = getLaplacianSubPixel(midX, midY);
            const lapThere = getLaplacianSubPixel(cx, cy);
            if (Math.sign(lapHere) !== Math.sign(lapThere) && magVal > maxMag * 0.05) {
              fzc = -0.1;
            }
          }

          // Balanced cost function: edges should attract (high fd) but not cause zigzag
          // fd=0.25 ensures path follows the edge direction, baseCost=0.70 ensures edge preference
          const stepCost = (0.70 * baseCost + 0.25 * fd + fzc) * weight;
          const newDist = dist[curr] + stepCost;
          const fScore = newDist + heuristic(nextIdx, targetIdx);

          if (newDist < dist[nextIdx]) {
            if (dist[nextIdx] === Infinity) {
              dirtyIndices[dirtyCount++] = nextIdx;
            }
            dist[nextIdx] = newDist;
            prev[nextIdx] = curr;
            pq.push(nextIdx, fScore);
          }
        }
      }
    }
  }

  if (dist[targetIdx] === Infinity) {
    return { points: [], totalCost: Infinity };
  }

  const rawPath: number[] = [];
  let curr: number | -1 = targetIdx;
  while (curr !== -1) {
    rawPath.push(curr % width, Math.floor(curr / width));
    if (curr === startIdx) break;
    curr = prev[curr];
  }

  const pathPoints: Point[] = [];
  for (let i = 0; i < rawPath.length; i += 2) {
    pathPoints.push({ x: rawPath[i], y: rawPath[i + 1] });
  }

  const simplified = simplifyPath(pathPoints, 0.4);

  let result: number[] = [];
  for (let i = simplified.length - 1; i >= 0; i--) {
    result.push(simplified[i].x, simplified[i].y);
  }

  // Zero-crossing refinement
  result = applyZeroCrossingRefinement(result);

  // Post-processing: Chaikin smoothing + Snake optimization
  result = postProcessPath(result);

  return { points: result, totalCost: dist[targetIdx] };
}

// ─── RDP SIMPLIFICATION ─────────────────────────────────────────────────────

function simplifyPath(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) { index = i; maxDist = d; }
  }
  if (maxDist > epsilon) {
    const left = simplifyPath(points.slice(0, index + 1), epsilon);
    const right = simplifyPath(points.slice(index), epsilon);
    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [points[0], points[points.length - 1]];
  }
}

function perpendicularDistance(p: Point, p1: Point, p2: Point): number {
  let x = p1.x, y = p1.y, dx = p2.x - x, dy = p2.y - y;
  if (dx !== 0 || dy !== 0) {
    let t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = p2.x; y = p2.y; }
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  dx = p.x - x; dy = p.y - y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ─── CHAIKIN CURVE SMOOTHING ────────────────────────────────────────────────

function chaikinSmooth(points: number[], iterations: number = 1): number[] {
  if (points.length < 4 || iterations <= 0) return points;
  let current = points;
  for (let iter = 0; iter < iterations; iter++) {
    if (current.length < 4) break;
    const smoothed: number[] = [];
    const n = current.length / 2;
    smoothed.push(current[0], current[1]);
    for (let i = 0; i < n - 1; i++) {
      const x1 = current[i * 2];
      const y1 = current[i * 2 + 1];
      const x2 = current[(i + 1) * 2];
      const y2 = current[(i + 1) * 2 + 1];
      // Use 0.25/0.75 ratio for less smoothing, preserving more of the original path
      smoothed.push(0.75 * x1 + 0.25 * x2, 0.75 * y1 + 0.25 * y2);
      smoothed.push(0.25 * x1 + 0.75 * x2, 0.25 * y1 + 0.75 * y2);
    }
    smoothed.push(current[current.length - 2], current[current.length - 1]);
    current = smoothed;
  }
  return current;
}

// ─── SNAKE / ACTIVE CONTOUR POST-PROCESSING ─────────────────────────────────

function snakeOptimize(
  points: number[],
  iterations: number = 2, // Reduced from 5 to minimize unnecessary point movement
  alpha: number = 0.04,   // Continuity force: prevents points from bunching up (reduces zigzag)
  beta: number = 0.08,    // Curvature force: keeps the path smooth
  gamma: number = 0.6     // Gradient attraction: strong enough to pull to edges, not too strong for zigzag
): number[] {
  if (points.length < 4) return points;
  const n = points.length / 2;
  let current = new Float64Array(points);
  for (let iter = 0; iter < iterations; iter++) {
    let avgDist = 0;
    for (let i = 0; i < n - 1; i++) {
      const dx = current[(i + 1) * 2] - current[i * 2];
      const dy = current[(i + 1) * 2 + 1] - current[i * 2 + 1];
      avgDist += Math.sqrt(dx * dx + dy * dy);
    }
    avgDist /= (n - 1);
    const next = new Float64Array(current);
    for (let i = 1; i < n - 1; i++) {
      const xi = current[i * 2];
      const yi = current[i * 2 + 1];
      const xPrev = current[(i - 1) * 2];
      const yPrev = current[(i - 1) * 2 + 1];
      const xNext = current[(i + 1) * 2];
      const yNext = current[(i + 1) * 2 + 1];
      const dxPrev = xi - xPrev;
      const dyPrev = yi - yPrev;
      const segLen = Math.sqrt(dxPrev * dxPrev + dyPrev * dyPrev);
      const continuityForce = (avgDist - segLen) * 0.08; // Moderate continuity to prevent zigzag
      const curvX = xPrev - 2 * xi + xNext;
      const curvY = yPrev - 2 * yi + yNext;
      const gradMag = getGradMagSubPixel(xi, yi);
      let bestGrad = gradMag;
      let bestDx = 0, bestDy = 0;
      const searchR = 1; // Reduced from 2 to prevent large jumps
      for (let dy = -searchR; dy <= searchR; dy++) {
        for (let dx = -searchR; dx <= searchR; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = xi + dx;
          const ny = yi + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const g = getGradMagSubPixel(nx, ny);
          if (g > bestGrad) { bestGrad = g; bestDx = dx; bestDy = dy; }
        }
      }
      const fx = gamma * bestDx + alpha * continuityForce * (dxPrev / (segLen + 0.01)) - beta * curvX;
      const fy = gamma * bestDy + alpha * continuityForce * (dyPrev / (segLen + 0.01)) - beta * curvY;
      next[i * 2] = xi + fx;
      next[i * 2 + 1] = yi + fy;
    }
    current = next;
  }
  return Array.from(current);
}

// ─── POST-PROCESSING PIPELINE ───────────────────────────────────────────────

function postProcessPath(points: number[]): number[] {
  if (points.length < 4) return points;
  let result = points;
  // Reduced iterations: 1 Chaikin pass (was 3) + 2 Snake passes (was 5)
  result = chaikinSmooth(result, 1);
  result = snakeOptimize(result, 2);
  return result;
}

// ─── SNAP (dinamik radius + sub-pixel) ──────────────────────────────────────

function getSnappedPoint(p: Point, bounds?: Bounds): Point {
  if (!costMap) return p;
  let minCost = Infinity;
  let best = p;
  const px = Math.floor(p.x);
  const py = Math.floor(p.y);
  const centerGrad = magnitude ? magnitude[py * width + px] : 0;
  const centerNorm = robustMaxMag > 0 ? centerGrad / robustMaxMag : 0;
  // Snap radius: wider search near edges to snap onto them, but with distance penalty
  let R: number;
  if (centerNorm > 0.3) R = 5;    // Already near an edge: search within 5px to snap precisely
  else R = 8;                      // Flat area: search within 8px to find nearest edge
  const snapBounds = bounds || { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1 };
  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      const nx = px + dx, ny = py + dy;
      if (nx < snapBounds.minX || nx > snapBounds.maxX || ny < snapBounds.minY || ny > snapBounds.maxY) continue;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const cost = getCostSubPixel(nx, ny);
      // Distance penalty: prefer closer points unless significantly better edge
      const distPenalty = (dx * dx + dy * dy) * 0.005;
      if (cost + distPenalty < minCost) {
        minCost = cost + distPenalty;
        best = { x: nx, y: ny };
      }
    }
  }
  return best;
}

// ─── WORKER MESSAGE HANDLER ─────────────────────────────────────────────────

self.onmessage = (e) => {
  const { type, data } = e.data;
  switch (type) {
    case 'INIT':
      init(data.imageData, data.width, data.height);
      self.postMessage({ type: 'INIT_DONE' });
      break;
    case 'FIND_PATH': {
      const { seed, target, requestId, bounds } = data;
      const result = findPath(seed, target, bounds);
      self.postMessage({ type: 'PATH_RESULT', data: { points: result.points, totalCost: result.totalCost, requestId } });
      break;
    }
    case 'SNAP': {
      const { point, seed, bounds, isAutoAnchor, requestId } = data;
      let snapBounds = bounds;
      if (!snapBounds && seed) {
        snapBounds = { minX: Math.max(0, seed.x - 10), minY: Math.max(0, seed.y - 10), maxX: Math.min(width - 1, seed.x + 10), maxY: Math.min(height - 1, seed.y + 10) };
      }
      const snapped = getSnappedPoint(point, snapBounds);
      const snapPath = seed ? findPath(seed, snapped, bounds) : { points: [], totalCost: 0 };
      self.postMessage({ 
        type: 'SNAP_RESULT', 
        data: { 
          point: snapped, 
          path: snapPath.points,
          isAutoAnchor: !!isAutoAnchor,
          requestId 
        } 
      });
      break;
    }
  }
};
