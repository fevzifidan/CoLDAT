import React, { useRef, useEffect } from 'react';
import { Group, Rect, Image as KonvaImage, Line, Circle } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { useAppStore } from '../../../../store/hooks/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { AnnotationShapes } from './AnnotationLayer';

interface MagnifierLensProps {
  imageUrl: string;
  children?: React.ReactNode;
}

export const MagnifierLens: React.FC<MagnifierLensProps> = ({ imageUrl, children }) => {
  const [image] = useImage(imageUrl, 'anonymous');
  const { 
    activeTool,
    scale: stageScale,
    isMagnifierActive,
    imgDimensions,
    brightness,
    contrast,
    saturation
  } = useAppStore(useShallow(state => ({
    activeTool: state.activeTool,
    scale: state.scale,
    isMagnifierActive: state.isMagnifierActive,
    imgDimensions: state.imgDimensions,
    brightness: state.brightness,
    contrast: state.contrast,
    saturation: state.saturation
  })));
  
  const lensRef = useRef<Konva.Group>(null);
  const contentRef = useRef<Konva.Group>(null);
  const imgRef = useRef<Konva.Image>(null);
  
  const magnifierScale = 2;
  const magnifierSize = 200; // Screen pixels
  
  useEffect(() => {
    const stage = lensRef.current?.getStage();
    if (!stage) return;
    
    const handleMouseMove = () => {
      if (!isMagnifierActive || activeTool === 'pan') {
         lensRef.current?.visible(false);
         return;
      }
      
      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) {
        lensRef.current?.visible(false);
        return;
      }

      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const relativePos = transform.point(pointerPos);
      
      if (lensRef.current && contentRef.current) {
        lensRef.current.visible(true);
        
        // Lens merkezini farenin olduğu konuma sabitle
        lensRef.current.position({ x: relativePos.x, y: relativePos.y });
        
        // Ekrandaki lens boyutunu sabit tutmak için sahne scale'ini tersine çevir
        lensRef.current.scale({ x: 1 / stageScale, y: 1 / stageScale });
        
        // İçeriği, o anki ekran yakınlaştırmasına (stageScale) göre ekstra büyüt (magnifierScale)
        const effectiveScale = stageScale * magnifierScale;
        contentRef.current.scale({ x: effectiveScale, y: effectiveScale });
        contentRef.current.position({
          x: -relativePos.x * effectiveScale,
          y: -relativePos.y * effectiveScale
        });
      }
    };
    
    stage.on('mousemove', handleMouseMove);
    return () => { stage.off('mousemove', handleMouseMove); };
  }, [stageScale, activeTool, isMagnifierActive]);

  // Apply filters caching for magnifier
  useEffect(() => {
    if (imgRef.current && image) {
      imgRef.current.cache();
    }
  }, [image, brightness, contrast, saturation]);

  if (!image || !isMagnifierActive) return null;

  return (
    <Group ref={lensRef} listening={false} visible={false}>
      <Group
        clipFunc={(ctx) => {
          ctx.arc(0, 0, magnifierSize / 2, 0, Math.PI * 2, false);
        }}
      >
        <Rect
          x={-magnifierSize / 2}
          y={-magnifierSize / 2}
          width={magnifierSize}
          height={magnifierSize}
          fill="#18181b"
        />
        
        <Group ref={contentRef}>
          <KonvaImage
            ref={imgRef}
            image={image}
            width={imgDimensions?.width}
            height={imgDimensions?.height}
            imageSmoothingEnabled={false}
            filters={[Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSV]}
            brightness={(brightness - 100) / 100}
            contrast={contrast - 100}
            saturation={(saturation - 100) / 100}
          />
          {/* Annotation Layer yansıması */}
          <AnnotationShapes />
          
          {/* Draft shapes from parent */}
          {children}
        </Group>

        {/* Artı İşareti (Crosshair) */}
        <Line points={[-10, 0, 10, 0]} stroke="#22c55e" strokeWidth={1} />
        <Line points={[0, -10, 0, 10]} stroke="#22c55e" strokeWidth={1} />
      </Group>
      
      {/* Dış Çerçeve */}
      <Circle radius={magnifierSize / 2} stroke="#52525b" strokeWidth={3} />
    </Group>
  );
};
