// src/features/landing/components/ThreeDViewport.tsx (Three.js 3D Görsel Versiyonu)
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeDViewportProps {
  type: 'nodes' | 'security' | 'segmentation' | 'interface';
}

const SCREENSHOT_MAP: Record<string, string> = {
  nodes: '@/../public/images/task-system.png',
  security: '@/../public/images/role-access.png',
  segmentation: '@/../public/images/mobilesam.png',
  interface: '@/../public/images/modern-editor.png',
};

export const ThreeDViewport: React.FC<ThreeDViewportProps> = ({ type }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageUrl = SCREENSHOT_MAP[type];

  useEffect(() => {
    if (!containerRef.current || !imageUrl) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 350;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Görseli Three.js dokusu olarak yüklüyoruz
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, (texture) => {
      // Ekran oranını korumak için düzlem geometrisi oluşturuyoruz (örn: 16:10 oranı için)
      const planeGeo = new THREE.PlaneGeometry(8, 5);
      const planeMat = new THREE.MeshBasicMaterial({ 
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      mainGroup.add(planeMesh);
    });

    // İnteraktivite için fare takibi
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / height) * 2 + 1;
    };

    container.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Yumuşak geçiş (lerp)
      targetX += (mouseX - targetX) * 0.08;
      targetY += (mouseY - targetY) * 0.08;

      // Hafif açısal eğme (Tilt efekti)
      mainGroup.rotation.y = targetX * 0.25;
      mainGroup.rotation.x = -targetY * 0.25;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 350;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [imageUrl]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[350px] bg-neutral-100/30 dark:bg-zinc-900/20 rounded-2xl border border-neutral-200/60 dark:border-zinc-800/80 flex items-center justify-center overflow-hidden transition-all duration-300"
    >
      <div className="absolute top-4 left-4 flex items-center gap-1.5 pointer-events-none z-10 bg-white/80 dark:bg-zinc-950/80 px-2 py-1 rounded-md backdrop-blur-sm border border-neutral-200/30 dark:border-zinc-800/30">
        <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
        <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 dark:text-zinc-400">
          3D_IMAGE_VIEWPORT
        </span>
      </div>
    </div>
  );
};