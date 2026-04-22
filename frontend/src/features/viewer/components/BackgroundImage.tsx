import React, { useEffect, useRef } from 'react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { useAppStore } from '../../../store/hooks/useAppStore';

interface BackgroundImageProps {
  url: string;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({ url }) => {
  const [image] = useImage(url);
  const imgRef = useRef<Konva.Image>(null);
  
  const { 
    setImgDimensions, 
    setIsLoaded,
    brightness,
    contrast,
    saturation
  } = useAppStore();

  useEffect(() => {
    if (image) {
      setImgDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight
      });
      setIsLoaded(true);
    }
  }, [image, setImgDimensions, setIsLoaded]);

  // Apply filters caching
  useEffect(() => {
    if (imgRef.current && image) {
      // Re-cache when filters or image change
      imgRef.current.cache();
    }
  }, [image, brightness, contrast, saturation]);

  if (!image) return null;

  return (
    <KonvaImage
      ref={imgRef}
      image={image}
      width={image.naturalWidth}
      height={image.naturalHeight}
      imageSmoothingEnabled={false} // Pixel perfect
      listening={false} // Background doesn't need to listen to events
      filters={[Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSV]}
      brightness={(brightness - 100) / 100}
      contrast={contrast - 100}
      saturation={(saturation - 100) / 100}
    />
  );
};
