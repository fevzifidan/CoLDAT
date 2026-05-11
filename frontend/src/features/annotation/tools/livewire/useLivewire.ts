import { useState, useEffect, useRef, useCallback } from 'react';
import Konva from 'konva';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { useCoordinateTransform } from '../../../viewer/hooks/useCoordinateTransform';
import LivewireWorker from './livewire.worker?worker';

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

// ─── ROI Hesaplama ──────────────────────────────────────────────────────────

function computeROI(seed: Point, target: Point, imgW: number, imgH: number): Bounds {
  const PADDING_RATIO = 0.40; // Increased from 0.20 for better context around edges
  const MIN_SIZE = 200; // Increased from 150
  
  let minX = Math.min(seed.x, target.x);
  let minY = Math.min(seed.y, target.y);
  let maxX = Math.max(seed.x, target.x);
  let maxY = Math.max(seed.y, target.y);
  
  const dx = (maxX - minX) * PADDING_RATIO;
  const dy = (maxY - minY) * PADDING_RATIO;
  minX = Math.max(0, Math.floor(minX - dx));
  minY = Math.max(0, Math.floor(minY - dy));
  maxX = Math.min(imgW, Math.ceil(maxX + dx));
  maxY = Math.min(imgH, Math.ceil(maxY + dy));
  
  if (maxX - minX < MIN_SIZE) {
    const center = (minX + maxX) / 2;
    minX = Math.max(0, Math.floor(center - MIN_SIZE / 2));
    maxX = Math.min(imgW, Math.ceil(center + MIN_SIZE / 2));
  }
  if (maxY - minY < MIN_SIZE) {
    const center = (minY + maxY) / 2;
    minY = Math.max(0, Math.floor(center - MIN_SIZE / 2));
    maxY = Math.min(imgH, Math.ceil(center + MIN_SIZE / 2));
  }
  
  return { minX, minY, maxX, maxY };
}

// ─── Açı Hesaplama (derece cinsinden) ───────────────────────────────────────

function computeAngle(p1: Point, p2: Point, p3: Point): number {
  // p1->p2 vektörü ile p2->p3 vektörü arasındaki açı
  const v1x = p2.x - p1.x;
  const v1y = p2.y - p1.y;
  const v2x = p3.x - p2.x;
  const v2y = p3.y - p2.y;
  
  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
  
  if (mag1 < 1 || mag2 < 1) return 0;
  
  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

// ─── Dynamic Anchor Kontrolü ────────────────────────────────────────────────

const ANCHOR_COST_THRESHOLD = 300;   // Increased from 50 - reduces auto-anchor frequency significantly
const ANCHOR_ANGLE_THRESHOLD = 60;   // Increased from 45 - only anchor on sharper turns
const ANCHOR_DISTANCE_THRESHOLD = 250; // Increased from 100 - allows longer segments before auto-anchoring

interface AnchorCheckResult {
  shouldAnchor: boolean;
  reason: 'cost' | 'angle' | 'distance' | null;
}

function shouldAutoAnchor(
  currentSnappedPoint: Point,
  seeds: Point[],
  committedPoints: number[],
  totalCost: number
): AnchorCheckResult {
  // 1. Cost threshold
  if (totalCost > ANCHOR_COST_THRESHOLD) {
    return { shouldAnchor: true, reason: 'cost' };
  }
  
  // 2. Açı sapması (son 3 committed nokta üzerinden, yeterli nokta varsa)
  if (committedPoints.length >= 6) {
    const lastThree = committedPoints.slice(-6); // [x1, y1, x2, y2, x3, y3]
    if (lastThree.length === 6) {
      const p1: Point = { x: lastThree[0], y: lastThree[1] };
      const p2: Point = { x: lastThree[2], y: lastThree[3] };
      const p3: Point = { x: lastThree[4], y: lastThree[5] };
      const angle = computeAngle(p1, p2, p3);
      if (angle > ANCHOR_ANGLE_THRESHOLD) {
        return { shouldAnchor: true, reason: 'angle' };
      }
    }
  }
  
  // 3. Mesafe kontrolü (son seed ile current arası)
  if (seeds.length > 0) {
    const lastSeed = seeds[seeds.length - 1];
    const dist = Math.sqrt(
      (currentSnappedPoint.x - lastSeed.x) ** 2 +
      (currentSnappedPoint.y - lastSeed.y) ** 2
    );
    if (dist > ANCHOR_DISTANCE_THRESHOLD) {
      return { shouldAnchor: true, reason: 'distance' };
    }
  }
  
  return { shouldAnchor: false, reason: null };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useLivewire = (previewLineRefs: React.RefObject<Konva.Line | null>[]) => {
  const activeTool = useAppStore(state => state.activeTool);
  const currentImage = useAppStore(state => state.currentImage);
  const annotatedObjects = useAppStore(state => state.annotatedObjects);
  const setAnnotatedObjects = useAppStore(state => state.setAnnotatedObjects);
  const imgDimensions = useAppStore(state => state.imgDimensions);

  const { getRelativePointerPosition } = useCoordinateTransform();
  
  const workerRef = useRef<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [seeds, setSeeds] = useState<Point[]>([]);
  const [committedPoints, setCommittedPoints] = useState<number[]>([]); 
  const [segmentSizes, setSegmentSizes] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastSnappedPoint, setLastSnappedPoint] = useState<Point | null>(null);
  
  const lastRequestId = useRef(0);
  const autoAnchorRequestId = useRef(0); // Track auto-anchor request IDs separately
  const lastBoundsRef = useRef<Bounds | null>(null);
  const isProcessingRef = useRef(false);
  const isAutoAnchoringRef = useRef(false); // Separate flag for auto-anchor in progress
  const pendingAutoAnchorRef = useRef<Point | null>(null);
  const lastPathTotalCostRef = useRef(0);
  const lastPathPointsRef = useRef<number[]>([]);

  // ── Worker'a auto anchor mesajı gönder (only if not already auto-anchoring) ──
  const triggerAutoAnchor = useCallback((snappedPoint: Point) => {
    if (!workerRef.current || seeds.length === 0) return;
    // Prevent concurrent auto-anchors
    if (isAutoAnchoringRef.current) return;
    
    const lastSeed = seeds[seeds.length - 1];
    let bounds: Bounds | undefined;
    if (imgDimensions) {
      bounds = computeROI(lastSeed, snappedPoint, imgDimensions.width, imgDimensions.height);
    }
    
    isAutoAnchoringRef.current = true;
    isProcessingRef.current = true;
    autoAnchorRequestId.current++;
    
    workerRef.current.postMessage({
      type: 'SNAP',
      data: { 
        point: snappedPoint,
        seed: lastSeed,
        bounds,
        isAutoAnchor: true,
        requestId: autoAnchorRequestId.current
      }
    });
  }, [seeds, imgDimensions]);

  // ── Worker initialization ──
  useEffect(() => {
    if (activeTool !== 'livewire' || !currentImage?.asset_url) return;

    const worker = new LivewireWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, data } = e.data;
      
      if (type === 'INIT_DONE') {
        setIsWorkerReady(true);
        
      } else if (type === 'PATH_RESULT') {
        isProcessingRef.current = false;
        
        // Only process non-auto-anchor path results or interactive preview paths
        if (data.requestId === lastRequestId.current) {
          // Son snapped noktayı güncelle
          if (data.points && data.points.length >= 2) {
            const lastX = data.points[data.points.length - 2];
            const lastY = data.points[data.points.length - 1];
            const snappedPoint: Point = { x: lastX, y: lastY };
            setLastSnappedPoint(snappedPoint);
            
            // Dynamic anchor kontrolü (daha az agresif - sadece mesafe bazlı)
            if (seeds.length > 0 && !isAutoAnchoringRef.current) {
              const lastSeed = seeds[seeds.length - 1];
              const dist = Math.sqrt(
                (snappedPoint.x - lastSeed.x) ** 2 +
                (snappedPoint.y - lastSeed.y) ** 2
              );
              // Only auto-anchor if distance is very large (user moved far)
              if (dist > ANCHOR_DISTANCE_THRESHOLD && data.totalCost > ANCHOR_COST_THRESHOLD) {
                pendingAutoAnchorRef.current = snappedPoint;
              }
            }
          }

          previewLineRefs.forEach(ref => {
            if (ref.current) {
              ref.current.points(data.points);
              ref.current.getLayer()?.batchDraw();
            }
          });
        }
        
      } else if (type === 'SNAP_RESULT') {
        // Clear both processing flags
        if (data.isAutoAnchor) {
          isAutoAnchoringRef.current = false;
        }
        isProcessingRef.current = false;
        
        // Only clear pending auto-anchor if this result matches
        if (pendingAutoAnchorRef.current) {
          pendingAutoAnchorRef.current = null;
        }
        
        const snappedPoint = data.point;
        const snapPath = data.path || [];
        
        setLastSnappedPoint(snappedPoint);
        setSeeds(prev => [...prev, snappedPoint]);
        
        setCommittedPoints(prev => {
          if (prev.length === 0) {
            setSegmentSizes([2]);
            return [snappedPoint.x, snappedPoint.y];
          } else {
            // Fix: Include the full path without slicing off start point
            // This prevents gaps between segments
            const newSegment = snapPath.length > 2 
              ? snapPath.slice(2) // skip the first point (it's the previous seed)
              : [snappedPoint.x, snappedPoint.y];
            setSegmentSizes(sizes => [...sizes, newSegment.length]);
            return [...prev, ...newSegment];
          }
        });
        
        // Preview temizle
        previewLineRefs.forEach(ref => {
          if (ref.current) {
            ref.current.points([]);
            ref.current.getLayer()?.batchDraw();
          }
        });

        // Eğer bekleyen auto-anchor varsa ve worker boşsa, hemen tetikle
        if (pendingAutoAnchorRef.current && !isAutoAnchoringRef.current) {
          const pending = pendingAutoAnchorRef.current;
          pendingAutoAnchorRef.current = null;
          triggerAutoAnchor(pending);
        }
      }
    };

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = currentImage.asset_url;
    img.onload = () => {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        worker.postMessage({
          type: 'INIT',
          data: {
            imageData: imageData.data,
            width: img.width,
            height: img.height
          }
        }, [imageData.data.buffer]);
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
      setIsWorkerReady(false);
      isProcessingRef.current = false;
      isAutoAnchoringRef.current = false;
      pendingAutoAnchorRef.current = null;
    };
    // Note: We deliberately exclude `seeds` and `committedPoints` from dependencies
    // to avoid re-initializing the worker on every seed change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, currentImage?.asset_url, triggerAutoAnchor]);

  // ── Reset ──
  const resetDrawing = useCallback(() => {
    setSeeds([]);
    setCommittedPoints([]);
    setSegmentSizes([]);
    setLastSnappedPoint(null);
    setIsDrawing(false);
    lastBoundsRef.current = null;
    isProcessingRef.current = false;
    isAutoAnchoringRef.current = false;
    pendingAutoAnchorRef.current = null;
    lastPathTotalCostRef.current = 0;
    lastPathPointsRef.current = [];
    previewLineRefs.forEach(ref => {
      if (ref.current) {
        ref.current.points([]);
        ref.current.getLayer()?.batchDraw();
      }
    });
  }, [previewLineRefs]);

  // ── Finalize ──
  const finalizeDrawing = useCallback(() => {
    if (committedPoints.length < 6) { 
      resetDrawing();
      return;
    }

    const newObject = {
      id: crypto.randomUUID(),
      label: `Polygon_${annotatedObjects.length + 1}`,
      classId: '', 
      type: 'polygon' as const,
      coordinates: [...committedPoints],
      color: '#22c55e',
      zIndex: annotatedObjects.length,
      visible: true,
      locked: false,
    };

    setAnnotatedObjects([...annotatedObjects, newObject]);
    resetDrawing();
  }, [committedPoints, annotatedObjects, setAnnotatedObjects, resetDrawing]);

  // ── Mouse Down (Seed / Anchor) ──
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool !== 'livewire' || !isWorkerReady || !workerRef.current) return;
    if (isProcessingRef.current) return;
    
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    // İlk seed'e geri dönüş kontrolü (polygon kapatma)
    if (seeds.length >= 3) {
      const firstSeed = seeds[0];
      const dist = Math.sqrt((pos.x - firstSeed.x) ** 2 + (pos.y - firstSeed.y) ** 2);
      if (dist < 10) { 
        finalizeDrawing();
        return;
      }
    }

    isProcessingRef.current = true;
    pendingAutoAnchorRef.current = null;
    
    let bounds: Bounds | undefined;
    const lastSeed = seeds.length > 0 ? seeds[seeds.length - 1] : null;
    if (lastSeed && imgDimensions) {
      bounds = computeROI(lastSeed, pos, imgDimensions.width, imgDimensions.height);
      lastBoundsRef.current = bounds;
    }

    workerRef.current.postMessage({
      type: 'SNAP',
      data: { 
        point: pos,
        seed: lastSeed,
        bounds
      }
    });
    
    setIsDrawing(true);
  }, [activeTool, isWorkerReady, getRelativePointerPosition, seeds, finalizeDrawing, imgDimensions]);

  // ── Mouse Move (Live Path) ──
  const lastRequestTime = useRef(0);
  const THROTTLE_MS = 16;

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool !== 'livewire' || !isDrawing || !workerRef.current || seeds.length === 0) return;
    // Auto anchor işleniyorsa veya worker meşgulse bekle
    if (isProcessingRef.current) return;
    
    const now = Date.now();
    if (now - lastRequestTime.current < THROTTLE_MS) return;
    lastRequestTime.current = now;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const seed = seeds[seeds.length - 1];
    
    let bounds: Bounds | undefined;
    if (imgDimensions) {
      bounds = computeROI(seed, pos, imgDimensions.width, imgDimensions.height);
      lastBoundsRef.current = bounds;
    }
    
    lastRequestId.current++;
    isProcessingRef.current = true;
    
    workerRef.current.postMessage({
      type: 'FIND_PATH',
      data: { 
        seed, 
        target: pos, 
        requestId: lastRequestId.current,
        bounds
      }
    });
  }, [activeTool, isDrawing, seeds, getRelativePointerPosition, imgDimensions]);

  // ── Undo Last Point ──
  const undoLastPoint = useCallback(() => {
    if (seeds.length <= 1) {
      resetDrawing();
      return;
    }

    const lastSegmentSize = segmentSizes[segmentSizes.length - 1] || 0;
    setSeeds(prev => prev.slice(0, -1));
    setSegmentSizes(prev => prev.slice(0, -1));
    setCommittedPoints(prev => prev.slice(0, -lastSegmentSize));

    previewLineRefs.forEach(ref => {
      if (ref.current) {
        ref.current.points([]);
        ref.current.getLayer()?.batchDraw();
      }
    });
    
    pendingAutoAnchorRef.current = null;
    lastPathTotalCostRef.current = 0;
    lastPathPointsRef.current = [];
  }, [seeds, segmentSizes, resetDrawing, previewLineRefs]);

  return {
    handleMouseDown,
    handleMouseMove,
    finalizeDrawing,
    undoLastPoint,
    resetDrawing,
    isDrawing,
    committedPoints,
    lastSnappedPoint,
    isWorkerReady
  };
};
