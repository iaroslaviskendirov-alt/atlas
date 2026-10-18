"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

// Каркасный глобус на заднем плане первого экрана. Отличия от исходного компонента:
// - цвет сетки берётся из CSS-переменной --foreground (three.js не понимает "hsl(var(--foreground))");
// - камера задаётся пропсом Canvas вместо PerspectiveCamera из drei — минус целая библиотека;
// - отрисовка останавливается, когда блок не виден на экране, и при «уменьшении движения».

interface DotGlobeHeroProps {
  rotationSpeed?: number;
  globeRadius?: number;
  className?: string;
  children?: React.ReactNode;
}

const Globe: React.FC<{
  rotationSpeed: number;
  radius: number;
  color: string;
}> = ({ rotationSpeed, radius, color }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed;
      groupRef.current.rotation.x += rotationSpeed * 0.3;
      groupRef.current.rotation.z += rotationSpeed * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} wireframe />
      </mesh>
    </group>
  );
};

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

const DotGlobeHero = React.forwardRef<HTMLDivElement, DotGlobeHeroProps>(
  ({ rotationSpeed = 0.005, globeRadius = 1, className, children, ...props }, ref) => {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(true);
    const [reduced, setReduced] = useState(false);
    const [color, setColor] = useState("#e6edfb");

    useEffect(() => {
      setColor(cssVar("--foreground", "#e6edfb"));
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const sync = () => setReduced(mq.matches);
      sync();
      mq.addEventListener("change", sync);
      const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
      if (rootRef.current) io.observe(rootRef.current);
      return () => {
        mq.removeEventListener("change", sync);
        io.disconnect();
      };
    }, []);

    return (
      <div
        ref={(el) => {
          rootRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        className={cn("relative w-full h-screen bg-background overflow-hidden", className)}
        {...props}
      >
        <div className="relative z-10 flex flex-col items-center justify-center h-full">{children}</div>

        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <Canvas camera={{ position: [0, 0, 3], fov: 75 }} dpr={[1, 1.5]} frameloop={visible && !reduced ? "always" : "demand"}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Globe rotationSpeed={reduced ? 0 : rotationSpeed} radius={globeRadius} color={color} />
          </Canvas>
        </div>
      </div>
    );
  },
);

DotGlobeHero.displayName = "DotGlobeHero";

export { DotGlobeHero, type DotGlobeHeroProps };
