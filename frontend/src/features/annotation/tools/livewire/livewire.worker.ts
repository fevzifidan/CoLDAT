/**
 * Priority Queue (Min-Heap) implementation for Dijkstra
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
        if (leftChild.priority < element.priority) {
          swap = leftChildIndex;
        }
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

// Global state for image data
let costMap: Float32Array | null = null;
let gradX: Float32Array | null = null;
let gradY: Float32Array | null = null;
let laplacian: Float32Array | null = null;
let width = 0;
let height = 0;

// Dijkstra state - persistent for incremental search
let dist: Float32Array;
let prev: Int32Array;
let visited: Uint8Array;
let lastSeedIdx = -1;
let pq = new PriorityQueue<number>();
let dirtyIndices: Int32Array;
let dirtyCount = 0;

/**
 * Preprocess image data
 */
function init(imageData: Uint8ClampedArray, w: number, h: number) {
  width = w;
  height = h;
  const size = w * h;
  
  // Initialize persistent arrays
  dist = new Float32Array(size).fill(Infinity);
  prev = new Int32Array(size).fill(-1);
  visited = new Uint8Array(size).fill(0);
  dirtyIndices = new Int32Array(size);
  dirtyCount = 0;
  lastSeedIdx = -1;
  pq.clear();

  const grayscale = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    grayscale[i] = 0.299 * imageData[i * 4] + 0.587 * imageData[i * 4 + 1] + 0.114 * imageData[i * 4 + 2];
  }

  // 3x3 Blur
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

  // Sobel & Laplacian
  gradX = new Float32Array(size);
  gradY = new Float32Array(size);
  laplacian = new Float32Array(size);
  const magnitude = new Float32Array(size);
  let maxMag = 0;

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

  // Cost Map
  costMap = new Float32Array(size);
  const robustMaxMag = maxMag * 0.8;
  for (let i = 0; i < size; i++) {
    const normMag = robustMaxMag > 0 ? Math.min(1.0, magnitude[i] / robustMaxMag) : 0;
    // Feature 1: Sharper power function for gradient magnitude
    const fz = Math.pow(1.0 - normMag, 6); 
    // Feature 2: Stronger Laplacian zero-crossing bonus
    const fl = (magnitude[i] > maxMag * 0.05 && Math.abs(laplacian[i]) < 1.5) ? 0 : 0.15;
    costMap[i] = fz + fl;
  }
}

/**
 * Incremental Dijkstra Pathfinding
 */
function findPath(seed: Point, target: Point): number[] {
  if (!costMap || !gradX || !gradY) return [];

  const startIdx = Math.floor(seed.y) * width + Math.floor(seed.x);
  const targetIdx = Math.floor(target.y) * width + Math.floor(target.x);

  if (startIdx < 0 || startIdx >= width * height || targetIdx < 0 || targetIdx >= width * height) return [];

  // 1. Reset if seed changed
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
    
    // Add seed to dirty tracker
    dirtyIndices[dirtyCount++] = startIdx;
  }

  // 2. Expand search if target not visited
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
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

          const nextIdx = ny * width + nx;
          if (visited[nextIdx]) continue;

          const weight = (dx !== 0 && dy !== 0) ? 1.414 : 1.0;
          
          // Directional Cost
          let fd = 0;
          const gMag = Math.sqrt(gradX[nextIdx]**2 + gradY[nextIdx]**2);
          if (gMag > 0.1) {
            const lx = dx / weight, ly = dy / weight;
            const gx = gradX[nextIdx] / gMag, gy = gradY[nextIdx] / gMag;
            fd = Math.abs(lx * gx + ly * gy); // Perpendicularity penalty
          }

          const stepCost = (0.85 * costMap[nextIdx] + 0.15 * fd) * weight;
          const newDist = dist[curr] + stepCost;

          if (newDist < dist[nextIdx]) {
            if (dist[nextIdx] === Infinity) {
              dirtyIndices[dirtyCount++] = nextIdx;
            }
            dist[nextIdx] = newDist;
            prev[nextIdx] = curr;
            pq.push(nextIdx, newDist);
          }
        }
      }
    }
  }

  // 3. Backtrack
  if (dist[targetIdx] === Infinity) return [];
  const rawPath: number[] = [];
  let curr: number | -1 = targetIdx;
  while (curr !== -1) {
    rawPath.push(curr % width, Math.floor(curr / width)); // Push X then Y
    if (curr === startIdx) break;
    curr = prev[curr];
  }
  
  const pathPoints: Point[] = [];
  for (let i = 0; i < rawPath.length; i += 2) {
    pathPoints.push({ x: rawPath[i], y: rawPath[i+1] });
  }
  // No need to reverse yet, simplify first then reverse
  const simplified = simplifyPath(pathPoints, 0.4); // Reduced from 1.0
  
  const result: number[] = [];
  for (let i = simplified.length - 1; i >= 0; i--) {
    result.push(simplified[i].x, simplified[i].y);
  }
  return result;
}

/**
 * Ramer-Douglas-Peucker Algorithm for Path Simplification
 */
function simplifyPath(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) {
      index = i;
      maxDist = d;
    }
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

/**
 * Simple Snap to local minimum cost
 */
function getSnappedPoint(p: Point): Point {
  if (!costMap) return p;
  let minCost = Infinity;
  let best = p;
  const R = 6; // Slightly larger range for better edge finding
  
  const px = Math.floor(p.x);
  const py = Math.floor(p.y);

  for (let dy = -R; dy <= R; dy++) {
    for (let dx = -R; dx <= R; dx++) {
      const nx = px + dx, ny = py + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const cost = costMap[ny * width + nx];
        // Factor in distance to prefer closer points if costs are similar
        const distPenalty = (dx * dx + dy * dy) * 0.001;
        const totalCost = cost + distPenalty;
        
        if (totalCost < minCost) {
          minCost = totalCost;
          best = { x: nx, y: ny };
        }
      }
    }
  }
  return best;
}

self.onmessage = (e) => {
  const { type, data } = e.data;
  switch (type) {
    case 'INIT':
      init(data.imageData, data.width, data.height);
      self.postMessage({ type: 'INIT_DONE' });
      break;
    case 'FIND_PATH':
      const points = findPath(data.seed, data.target);
      self.postMessage({ type: 'PATH_RESULT', data: { points, requestId: data.requestId } });
      break;
    case 'SNAP':
      const snapped = getSnappedPoint(data.point);
      const snapPath = data.seed ? findPath(data.seed, snapped) : [];
      self.postMessage({ type: 'SNAP_RESULT', data: { point: snapped, path: snapPath } });
      break;
  }
};
