import { useState, useEffect, useRef, useCallback } from 'react';
import Konva from 'konva';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { useCoordinateTransform } from '../../../viewer/hooks/useCoordinateTransform';
import LivewireWorker from './livewire.worker?worker';

interface Point {
  x: number;
  y: number;
}

export const useLivewire = (previewLineRefs: React.RefObject<Konva.Line | null>[]) => {
  const activeTool = useAppStore(state => state.activeTool);
  const currentImage = useAppStore(state => state.currentImage);
  const annotatedObjects = useAppStore(state => state.annotatedObjects);
  const setAnnotatedObjects = useAppStore(state => state.setAnnotatedObjects);

  const { getRelativePointerPosition } = useCoordinateTransform();
  
  const workerRef = useRef<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [seeds, setSeeds] = useState<Point[]>([]);
  const [committedPoints, setCommittedPoints] = useState<number[]>([]); 
  const [segmentSizes, setSegmentSizes] = useState<number[]>([]); // Tracks number of coordinates added per segment
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastSnappedPoint, setLastSnappedPoint] = useState<Point | null>(null);
  
  const lastRequestId = useRef(0);

  // Initialize Worker
  useEffect(() => {
    if (activeTool !== 'livewire' || !currentImage?.asset_url) return;

    const worker = new LivewireWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === 'INIT_DONE') {
        setIsWorkerReady(true);
      } else if (type === 'PATH_RESULT') {
        if (data.requestId === lastRequestId.current) {
          // Update last snapped point for visual feedback
          if (data.points && data.points.length >= 2) {
            const lastX = data.points[data.points.length - 2];
            const lastY = data.points[data.points.length - 1];
            setLastSnappedPoint({ x: lastX, y: lastY });
          }

          previewLineRefs.forEach(ref => {
            if (ref.current) {
              ref.current.points(data.points);
              ref.current.getLayer()?.batchDraw();
            }
          });
        }
      } else if (type === 'SNAP_RESULT') {
        const snappedPoint = data.point;
        const snapPath = data.path || [];
        
        setLastSnappedPoint(snappedPoint);
        setSeeds(prev => [...prev, snappedPoint]);
        setCommittedPoints(prev => {
          if (prev.length === 0) {
            setSegmentSizes([2]);
            return [snappedPoint.x, snappedPoint.y];
          } else {
            const newSegment = snapPath.length > 2 ? snapPath.slice(2) : [snappedPoint.x, snappedPoint.y];
            setSegmentSizes(sizes => [...sizes, newSegment.length]);
            return [...prev, ...newSegment];
          }
        });
        
        // Clear preview lines
        previewLineRefs.forEach(ref => {
          if (ref.current) {
            ref.current.points([]);
            ref.current.getLayer()?.batchDraw();
          }
        });
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
    };
  }, [activeTool, currentImage?.asset_url]);

  const resetDrawing = useCallback(() => {
    setSeeds([]);
    setCommittedPoints([]);
    setSegmentSizes([]);
    setLastSnappedPoint(null);
    setIsDrawing(false);
    previewLineRefs.forEach(ref => {
      if (ref.current) {
        ref.current.points([]);
        ref.current.getLayer()?.batchDraw();
      }
    });
  }, [previewLineRefs]);

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

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool !== 'livewire' || !isWorkerReady || !workerRef.current) return;
    
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    if (seeds.length >= 3) {
      const firstSeed = seeds[0];
      const dist = Math.sqrt((pos.x - firstSeed.x) ** 2 + (pos.y - firstSeed.y) ** 2);
      if (dist < 10) { 
        finalizeDrawing();
        return;
      }
    }

    workerRef.current.postMessage({
      type: 'SNAP',
      data: { 
        point: pos,
        seed: seeds.length > 0 ? seeds[seeds.length - 1] : null
      }
    });
    
    setIsDrawing(true);
  }, [activeTool, isWorkerReady, getRelativePointerPosition, seeds, finalizeDrawing]);

  const lastRequestTime = useRef(0);
  const THROTTLE_MS = 16; // ~60 FPS

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool !== 'livewire' || !isDrawing || !workerRef.current || seeds.length === 0) return;
    
    const now = Date.now();
    if (now - lastRequestTime.current < THROTTLE_MS) return;
    lastRequestTime.current = now;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const seed = seeds[seeds.length - 1];
    lastRequestId.current++;
    
    workerRef.current.postMessage({
      type: 'FIND_PATH',
      data: { seed, target: pos, requestId: lastRequestId.current }
    });
  }, [activeTool, isDrawing, seeds, getRelativePointerPosition]);

  const undoLastPoint = useCallback(() => {
    if (seeds.length <= 1) {
      resetDrawing();
      return;
    }

    const lastSegmentSize = segmentSizes[segmentSizes.length - 1] || 0;
    setSeeds(prev => prev.slice(0, -1));
    setSegmentSizes(prev => prev.slice(0, -1));
    setCommittedPoints(prev => prev.slice(0, -lastSegmentSize));

    // Clear preview
    previewLineRefs.forEach(ref => {
      if (ref.current) {
        ref.current.points([]);
        ref.current.getLayer()?.batchDraw();
      }
    });
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
