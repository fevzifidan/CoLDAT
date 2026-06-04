import { useState, useEffect, useRef, useCallback } from 'react';
import Konva from 'konva';
import simplify from 'simplify-js';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { useCoordinateTransform } from '../../../viewer/hooks/useCoordinateTransform';

interface Point {
  x: number;
  y: number;
}

export const useLivewire = (previewLineRefs: React.RefObject<Konva.Line | null>[]) => {
  const activeTool = useAppStore(state => state.activeTool);
  const currentImage = useAppStore(state => state.currentImage);
  const annotatedObjects = useAppStore(state => state.annotatedObjects);
  const setAnnotatedObjects = useAppStore(state => state.setAnnotatedObjects);
  const imgDimensions = useAppStore(state => state.imgDimensions);

  // Livewire store states
  const setLivewireStatus = useAppStore(state => state.setLivewireStatus);
  const setLivewireProgress = useAppStore(state => state.setLivewireProgress);
  const resetLivewireState = useAppStore(state => state.resetLivewireState);
  const livewireEpsilon = useAppStore(state => state.livewireEpsilon);

  const scale = useAppStore(state => state.scale);

  const { getRelativePointerPosition } = useCoordinateTransform();
  
  const workerRef = useRef<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [seeds, setSeeds] = useState<Point[]>([]);
  const [committedPoints, setCommittedPoints] = useState<number[]>([]); 
  const [segmentSizes, setSegmentSizes] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastSnappedPoint, setLastSnappedPoint] = useState<Point | null>(null);
  
  const parentPointsRef = useRef<Int32Array | null>(null);
  const gradientRef = useRef<Float32Array | null>(null);

  // ─── Client-Side Snapping ───
  const snapPoint = useCallback((p: Point): Point => {
    const gradient = gradientRef.current;
    if (!gradient || !imgDimensions) return p;
    const { width, height } = imgDimensions;
    
    // 1. First anchor snap-to-close check (using scale-adjusted threshold)
    if (isDrawing && seeds.length > 0) {
      const firstSeed = seeds[0];
      const dist = Math.sqrt((p.x - firstSeed.x) ** 2 + (p.y - firstSeed.y) ** 2);
      const visualSnapRadius = 12 / Math.max(scale, 0.01);
      if (dist < visualSnapRadius) { 
        return firstSeed;
      }
    }
    
    let minGrad = Infinity;
    let bestX = Math.round(p.x);
    let bestY = Math.round(p.y);
    
    const snapSize = 2; // Match desktop's default 5x5 window for maximum control and precision
    const sx = Math.max(0, bestX - snapSize);
    const sy = Math.max(0, bestY - snapSize);
    const ex = Math.min(width - 1, bestX + snapSize);
    const ey = Math.min(height - 1, bestY + snapSize);
    
    for (let y = sy; y <= ey; y++) {
      for (let x = sx; x <= ex; x++) {
        const idx = y * width + x;
        const grad = gradient[idx];
        if (grad < minGrad) {
          minGrad = grad;
          bestX = x;
          bestY = y;
        }
      }
    }
    
    return { x: bestX, y: bestY };
  }, [imgDimensions, seeds, isDrawing, scale]);

  // ─── Client-Side Path Tracing (O(N) Backpointer Traversal) ───
  const getPathFrom = useCallback((target: Point, seed: Point): Point[] => {
    const path: Point[] = [];
    if (!parentPointsRef.current || !imgDimensions) return [];
    
    const { width } = imgDimensions;
    const targetX = Math.round(target.x);
    const targetY = Math.round(target.y);
    const seedX = Math.round(seed.x);
    const seedY = Math.round(seed.y);
    
    let currIdx = targetY * width + targetX;
    const seedIdx = seedY * width + seedX;
    
    const visited = new Set<number>();
    
    while (currIdx !== -1 && currIdx !== seedIdx && !visited.has(currIdx)) {
      visited.add(currIdx);
      const x = currIdx % width;
      const y = Math.floor(currIdx / width);
      path.push({ x, y });
      currIdx = parentPointsRef.current[currIdx];
    }
    
    if (currIdx === seedIdx) {
      path.push(seed);
    }
    
    return path; // returns target -> ... -> seed
  }, [imgDimensions]);

  // ── Worker initialization ──
  useEffect(() => {
    if (activeTool !== 'livewire' || !currentImage?.asset_url) return;

    setLivewireStatus('preprocessing');
    setLivewireProgress('Initializing background worker...');

    const worker = new Worker('/external/scissors/scissorsWorker.js');
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { msgType, results, status, gradient } = e.data;
      
      switch (msgType) {
        case -1: // Message.STATUS
          if (status) {
            setLivewireProgress(status);
          }
          break;
          
        case -3: // Message.RESULTS
          if (results && parentPointsRef.current) {
            for (let i = 0; i < results.length; i += 2) {
              const p = results[i];
              const q = results[i + 1];
              parentPointsRef.current[p] = q;
            }
            // Ask worker to continue computing next batch
            worker.postMessage({ msgType: 2 }); // Message.CONTINUE
          }
          break;
          
        case -4: // Message.GRADIENT
          if (gradient) {
            gradientRef.current = gradient;
            setLivewireStatus('ready');
            setIsWorkerReady(true);
          }
          break;
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
        
        const data = imageData.data;
        const greyscale = new Float32Array(data.length / 4);
        for (let i = 0; i < data.length; i += 4) {
          greyscale[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / (3 * 255);
        }

        // Initialize client-side arrays
        parentPointsRef.current = new Int32Array(img.width * img.height);
        parentPointsRef.current.fill(-1);

        setLivewireProgress('Analyzing image details...');
        
        // Post greyscale image buffer to worker (Message.IMAGE = 4)
        worker.postMessage({
          msgType: 4,
          imageData: greyscale,
          mask: null,
          width: img.width,
          height: img.height
        }, [greyscale.buffer]);

        // Enable on-the-fly interactive training (Message.TRAIN = 6)
        worker.postMessage({ msgType: 6, train: true });
      }
    };

    img.onerror = () => {
      setLivewireStatus('idle');
      setLivewireProgress('Error loading image.');
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
      setIsWorkerReady(false);
      gradientRef.current = null;
      parentPointsRef.current = null;
      resetLivewireState();
    };
  }, [activeTool, currentImage?.asset_url, setLivewireStatus, setLivewireProgress, resetLivewireState]);

  // ── Reset ──
  const resetDrawing = useCallback(() => {
    setSeeds([]);
    setCommittedPoints([]);
    setSegmentSizes([]);
    setLastSnappedPoint(null);
    setIsDrawing(false);
    
    if (parentPointsRef.current) {
      parentPointsRef.current.fill(-1);
    }
    if (workerRef.current) {
      workerRef.current.postMessage({ msgType: 3 }); // Message.STOP
    }

    previewLineRefs.forEach(ref => {
      if (ref.current) {
        ref.current.points([]);
        ref.current.getLayer()?.batchDraw();
      }
    });
  }, [previewLineRefs]);

  // ── Finalize ──
  const finalizeDrawing = useCallback(() => {
    if (seeds.length < 3 || committedPoints.length < 6) { 
      resetDrawing();
      return;
    }

    // Close the loop perfectly by finding the optimized cost path from the first seed back to the last seed
    const lastSeed = seeds[seeds.length - 1];
    const firstSeed = seeds[0];
    const closingPath = getPathFrom(firstSeed, lastSeed).reverse();
    const closingCoords = closingPath.flatMap(p => [p.x, p.y]);
    const closingSegment = closingCoords.slice(2); // skip first [x, y] to avoid duplicates

    const finalCoords = [...committedPoints, ...closingSegment];

    // Convert flat coordinates array [x1, y1, x2, y2, ...] to Point[] array for simplify-js
    const rawPoints: Point[] = [];
    for (let i = 0; i < finalCoords.length; i += 2) {
      rawPoints.push({ x: finalCoords[i], y: finalCoords[i + 1] });
    }

    // Simplify polygon coordinates using simplify-js
    const simplifiedPoints = simplify(rawPoints, livewireEpsilon, true);

    // Convert back to flat coordinates array
    const simplifiedCoords: number[] = [];
    for (const pt of simplifiedPoints) {
      simplifiedCoords.push(pt.x, pt.y);
    }

        const taxonomy = useAppStore.getState().taxonomy;
    const firstClassId = taxonomy.classes.length > 0 ? taxonomy.classes[0].id : '';

    const newObject = {
      id: crypto.randomUUID(),
      label: `Polygon_${annotatedObjects.length + 1}`,
      classId: firstClassId, 
      type: 'polygon' as const,
      coordinates: simplifiedCoords,
      color: '#22c55e',
      zIndex: annotatedObjects.length,
      visible: true,
      locked: false,
    };

    setAnnotatedObjects([...annotatedObjects, newObject]);
    resetDrawing();
  }, [committedPoints, seeds, annotatedObjects, setAnnotatedObjects, resetDrawing, getPathFrom, livewireEpsilon]);

  // ── Mouse Down (Seed / Anchor Placement) ──
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool !== 'livewire' || !isWorkerReady || !workerRef.current) return;
    
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const snapped = snapPoint(pos);

    // Loop closing check (using scale-adjusted threshold)
    if (seeds.length >= 3) {
      const firstSeed = seeds[0];
      const dist = Math.sqrt((snapped.x - firstSeed.x) ** 2 + (snapped.y - firstSeed.y) ** 2);
      const visualSnapRadius = 12 / Math.max(scale, 0.01);
      if (dist < visualSnapRadius) { 
        finalizeDrawing();
        return;
      }
    }

    if (seeds.length === 0) {
      // First seed
      setSeeds([snapped]);
      setCommittedPoints([snapped.x, snapped.y]);
      setSegmentSizes([2]);
    } else {
      // Subsequent seed: Trace optimal path from snapped target back to last seed
      const lastSeed = seeds[seeds.length - 1];
      const path = getPathFrom(snapped, lastSeed).reverse();
      const pathCoords = path.flatMap(p => [p.x, p.y]);
      const newSegment = pathCoords.slice(2); // skip the last seed to avoid duplicating it

      setCommittedPoints(prev => [...prev, ...newSegment]);
      setSegmentSizes(prev => [...prev, newSegment.length]);
      setSeeds(prev => [...prev, snapped]);
    }

    if (parentPointsRef.current) {
      parentPointsRef.current.fill(-1);
    }

    // Set new seed point inside the worker (Message.POINT = 1)
    workerRef.current.postMessage({
      msgType: 1,
      point: snapped
    });
    
    setIsDrawing(true);
    setLastSnappedPoint(snapped);

    // Clear preview line
    previewLineRefs.forEach(ref => {
      if (ref.current) {
        ref.current.points([]);
        ref.current.getLayer()?.batchDraw();
      }
    });
  }, [activeTool, isWorkerReady, getRelativePointerPosition, seeds, snapPoint, getPathFrom, finalizeDrawing, previewLineRefs, scale]);

  // ── Mouse Move (Live Preview Path) ──
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool !== 'livewire' || !isDrawing || seeds.length === 0) return;
    
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const snapped = snapPoint(pos);
    setLastSnappedPoint(snapped);

    const seed = seeds[seeds.length - 1];
    const path = getPathFrom(snapped, seed).reverse();
    const flatPoints = path.flatMap(p => [p.x, p.y]);

    previewLineRefs.forEach(ref => {
      if (ref.current) {
        ref.current.points(flatPoints);
        ref.current.getLayer()?.batchDraw();
      }
    });
  }, [activeTool, isDrawing, seeds, snapPoint, getPathFrom, previewLineRefs]);

  // ── Undo Last Point ──
  const undoLastPoint = useCallback(() => {
    if (seeds.length <= 1) {
      resetDrawing();
      return;
    }

    const lastSize = segmentSizes[segmentSizes.length - 1] || 0;
    const nextSeeds = seeds.slice(0, -1);
    const nextSizes = segmentSizes.slice(0, -1);
    const nextCommitted = committedPoints.slice(0, -lastSize);

    setSeeds(nextSeeds);
    setSegmentSizes(nextSizes);
    setCommittedPoints(nextCommitted);

    previewLineRefs.forEach(ref => {
      if (ref.current) {
        ref.current.points([]);
        ref.current.getLayer()?.batchDraw();
      }
    });
    
    if (workerRef.current) {
      if (parentPointsRef.current) {
        parentPointsRef.current.fill(-1);
      }
      workerRef.current.postMessage({ msgType: 3 }); // Message.STOP
      workerRef.current.postMessage({
        msgType: 1, // Message.POINT
        point: nextSeeds[nextSeeds.length - 1]
      });
    }

    const newLastSeed = nextSeeds[nextSeeds.length - 1];
    setLastSnappedPoint(newLastSeed);
  }, [seeds, segmentSizes, committedPoints, resetDrawing, previewLineRefs]);

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

