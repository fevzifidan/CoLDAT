import { useState } from 'react'; // useRef kaldırıldı
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  key: number;
}

const AnnotationCanvas = () => {
  const [image] = useImage('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000');
  const [rects, setRects] = useState<Rectangle[]>([]);
  const [newRect, setNewRect] = useState<Rectangle | null>(null);

  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage();
    const { x, y } = stage.getPointerPosition();
    setNewRect({ x, y, width: 0, height: 0, key: rects.length });
  };

  const handleMouseMove = (e: any) => {
    if (!newRect) return;
    const stage = e.target.getStage();
    const { x, y } = stage.getPointerPosition();
    
    setNewRect({
      ...newRect,
      width: x - newRect.x,
      height: y - newRect.y,
    });
  };

  const handleMouseUp = () => {
    if (newRect) {
      setRects([...rects, newRect]);
      setNewRect(null);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden cursor-crosshair rounded-xl shadow-inner">
      <Stage
        width={800} 
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {image && <KonvaImage image={image} width={800} height={600} />}
          {rects.map((rect, i) => (
            <Rect
              key={i}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              stroke="#3b82f6"
              strokeWidth={2}
              fill="rgba(59, 130, 246, 0.2)"
            />
          ))}
          {newRect && (
            <Rect
              x={newRect.x}
              y={newRect.y}
              width={newRect.width}
              height={newRect.height}
              stroke="#ef4444"
              strokeWidth={2}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default AnnotationCanvas;