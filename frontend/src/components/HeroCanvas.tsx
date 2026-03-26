import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ──────────────────────────────────────────────
   HeroCanvas – WebGL spotlight text.

   Approach: render the text to an off-screen
   Canvas2D texture, then display it on a plane
   with a custom shader that handles:
   • Base layer: faint (7% opacity)
   • Spotlight overlay: radial mask around mouse

   Mouse tracking is done at the DOM level (not
   R3F raycasting) for reliability.
   ────────────────────────────────────────────── */

interface HeroCanvasProps {
  text?: string;
  spotlightSize?: number;
  lineHeight?: number;
  textBlur?: number;
  spotlightSoftness?: number;
}

// Shared state for DOM → R3F communication
const mouseState = {
  x: 0,
  y: 0,
  hovering: false,
};

// ── Inner scene component (must be inside <Canvas>) ──

interface SpotlightSceneProps {
  text: string;
  spotlightSize: number;
  lineHeight: number;
  spotlightSoftness: number;
  textBlur: number;
}

function SpotlightScene({
  text,
  spotlightSize,
  lineHeight,
  spotlightSoftness,
  textBlur,
}: SpotlightSceneProps) {
  const { viewport, size, invalidate, camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const hoverRef = useRef(0);

  const lines = useMemo(
    () => text.split('\n').filter((l) => l.trim().length > 0),
    [text]
  );

  // Read CSS variable for text color
  const textColor = useMemo(() => {
    if (typeof document === 'undefined') return '#f4f4f4';
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue('--color-text-primary').trim() || '#f4f4f4';
  }, []);

  // ── Create text textures via Canvas2D (sharp + blurred + outline) ──
  const { sharpTexture, blurredTexture, strokeTexture } = useMemo(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const canvasW = Math.round(size.width * dpr);
    const canvasH = Math.round(size.height * dpr);

    // Measure each line and compute font size to fill width
    const padding = canvasW * 0.01;
    const availableWidth = canvasW - padding * 2;

    const fontSizes: number[] = [];
    // Use an off-screen canvas just for measuring before allocating dual canvasses
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d')!;

    for (const line of lines) {
      let lo = 10;
      let hi = canvasH;
      while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2;
        measureCtx.font = `900 ${mid}px "Geist", system-ui, sans-serif`;
        const metrics = measureCtx.measureText(line.toUpperCase());
        if (metrics.width > availableWidth) {
          hi = mid;
        } else {
          lo = mid;
        }
      }
      fontSizes.push(lo);
    }

    // Compute total height and position each line
    const lineHeights = fontSizes.map((fs) => fs * lineHeight);
    const totalHeight = lineHeights.reduce((sum, h) => sum + h, 0);

    const drawCanvas = (blur: number, isStroke = false) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d')!;

      // Clear
      ctx.clearRect(0, 0, canvasW, canvasH);
      
      if (blur > 0) ctx.filter = `blur(${blur * dpr}px)`;

      let yStart = (canvasH - totalHeight) / 2;

      if (isStroke) {
        // Pass 1: Draw the thick stroke AND the fill for all text to create a solid silhouette
        // This merges all the overlapping geometry inside the letters.
        for (let i = 0; i < lines.length; i++) {
          const fs = fontSizes[i];
          const lh = lineHeights[i];
          ctx.font = `900 ${fs}px "Geist", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const y = yStart + lh / 2;

          ctx.strokeStyle = textColor;
          ctx.lineWidth = Math.max(1, fs * 0.015) * 2; // Double thickness because half goes inside
          ctx.lineJoin = 'miter'; 
          ctx.miterLimit = 2; // Prevent sharp spikes on letters like M
          ctx.strokeText(lines[i].toUpperCase(), canvasW / 2, y);
          
          ctx.fillStyle = textColor;
          ctx.fillText(lines[i].toUpperCase(), canvasW / 2, y);

          yStart += lh;
        }

        // Pass 2: Punch out exactly the fill shape to leave only the exterior outline
        ctx.globalCompositeOperation = 'destination-out';
        yStart = (canvasH - totalHeight) / 2;
        for (let i = 0; i < lines.length; i++) {
          const fs = fontSizes[i];
          const lh = lineHeights[i];
          ctx.font = `900 ${fs}px "Geist", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const y = yStart + lh / 2;

          ctx.fillStyle = '#000'; // Color doesn't matter, just acts as eraser
          ctx.fillText(lines[i].toUpperCase(), canvasW / 2, y);

          yStart += lh;
        }
        ctx.globalCompositeOperation = 'source-over';

      } else {
        // Normal sharp or blurred fill pass
        for (let i = 0; i < lines.length; i++) {
          const fs = fontSizes[i];
          const lh = lineHeights[i];
          ctx.font = `900 ${fs}px "Geist", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const y = yStart + lh / 2;

          ctx.fillStyle = textColor;
          ctx.fillText(lines[i].toUpperCase(), canvasW / 2, y);

          yStart += lh;
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      return texture;
    };

    return {
      sharpTexture: drawCanvas(0),
      blurredTexture: drawCanvas(textBlur),
      strokeTexture: drawCanvas(0, true),
    };
  }, [text, textColor, size.width, size.height, lines, lineHeight, textBlur]);

  // ── Shader material ──
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTextureSharp: { value: sharpTexture },
        uTextureBlurred: { value: blurredTexture },
        uTextureStroke: { value: strokeTexture },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uSpotlightSize: { value: spotlightSize },
        uSpotlightSoftness: { value: spotlightSoftness },
        uBaseOpacity: { value: 0.07 },
        uHovering: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec2 vWorldPos;
        void main() {
          vUv = uv;
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTextureSharp;
        uniform sampler2D uTextureBlurred;
        uniform sampler2D uTextureStroke;
        uniform vec2 uMouse;
        uniform float uSpotlightSize;
        uniform float uSpotlightSoftness;
        uniform float uBaseOpacity;
        uniform float uHovering;
        uniform float uTime;

        varying vec2 vUv;
        varying vec2 vWorldPos;

        void main() {
          vec4 colorSharp = texture2D(uTextureSharp, vUv);
          vec4 colorBlurred = texture2D(uTextureBlurred, vUv);
          vec4 colorStroke = texture2D(uTextureStroke, vUv);

          // Spotlight mask — radial from mouse position (world coords)
          float dist = length(vWorldPos - uMouse);
          float radius = uSpotlightSize;
          float softEdge = radius * (uSpotlightSoftness / 100.0);
          float spotMask = 1.0 - smoothstep(radius - softEdge, radius + softEdge * 0.5, dist);

          float spotAlpha = spotMask * uHovering;
          
          // Mix colors based on spotAlpha
          // Outside spotlight -> baseOpacity with blurred texture
          // Inside spotlight -> max opacity 0.2 with sharp texture for readability
          float fillOpacity = mix(uBaseOpacity, 0.2, spotAlpha);
          vec4 mixedFill = mix(colorBlurred, colorSharp, spotAlpha);

          // Animated traveling glow on the stroke
          // Use world position to have a diagonal sweeping wave over the text
          float sweep = sin((vWorldPos.x + vWorldPos.y) * 0.015 - uTime * 2.5);
          float glowPulse = smoothstep(0.7, 1.0, sweep);
          
          // Show stroke largely inside spotlight
          float strokeAlpha = colorStroke.a * spotAlpha;
          // Add pulse on top
          float finalStrokeAlpha = strokeAlpha * (0.3 + glowPulse * 1.5);
          
          vec3 finalColor = mixedFill.rgb;
          float finalAlpha = mixedFill.a * fillOpacity;
          
          // Screen-blend the glowing stroke on top
          finalColor = mix(finalColor, colorStroke.rgb, min(1.0, finalStrokeAlpha));
          finalAlpha = max(finalAlpha, finalStrokeAlpha);

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
    });
  }, [sharpTexture, blurredTexture, strokeTexture, spotlightSize, spotlightSoftness]);

  // Update texture when deps change
  useEffect(() => {
    shaderMaterial.uniforms.uTextureSharp.value = sharpTexture;
    shaderMaterial.uniforms.uTextureBlurred.value = blurredTexture;
    shaderMaterial.uniforms.uTextureStroke.value = strokeTexture;
    shaderMaterial.uniforms.uSpotlightSize.value = spotlightSize;
    shaderMaterial.uniforms.uSpotlightSoftness.value = spotlightSoftness;
    shaderMaterial.needsUpdate = true;
    invalidate();
  }, [sharpTexture, blurredTexture, strokeTexture, spotlightSize, spotlightSoftness, shaderMaterial, invalidate]);

  // Convert DOM mouse coords to world coords and update uniforms each frame
  useFrame((state) => {
    // Tick time
    shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;

    // Convert pixel coords to NDC (-1 to 1)
    const ndcX = (mouseState.x / size.width) * 2 - 1;
    const ndcY = -(mouseState.y / size.height) * 2 + 1;

    // NDC to world (orthographic camera)
    const worldX = ndcX * (viewport.width / 2);
    const worldY = ndcY * (viewport.height / 2);

    shaderMaterial.uniforms.uMouse.value.set(worldX, worldY);

    // Smooth hover
    const target = mouseState.hovering ? 1 : 0;
    hoverRef.current += (target - hoverRef.current) * 0.12;
    if (Math.abs(hoverRef.current - target) < 0.001) {
      hoverRef.current = target;
    } else {
      invalidate(); // Keep animating
    }
    shaderMaterial.uniforms.uHovering.value = hoverRef.current;
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <planeGeometry args={[viewport.width, viewport.height]} />
    </mesh>
  );
}

// ── Main export ──

export default function HeroCanvas({
  text = 'SMART\nCATERING',
  spotlightSize = 350,
  lineHeight = 0.9,
  textBlur = 5,
  spotlightSoftness = 50,
}: HeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const invalidateRef = useRef<(() => void) | null>(null);

  // DOM-level mouse tracking
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      mouseState.x = e.clientX - rect.left;
      mouseState.y = e.clientY - rect.top;
      invalidateRef.current?.();
    };

    const onEnter = () => {
      mouseState.hovering = true;
      invalidateRef.current?.();
    };

    const onLeave = () => {
      mouseState.hovering = false;
      invalidateRef.current?.();
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'auto',
        cursor: 'default',
      }}
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 100], near: 0.1, far: 1000 }}
        frameloop="demand"
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ invalidate }) => {
          invalidateRef.current = invalidate;
        }}
      >
        <SpotlightScene
          text={text}
          spotlightSize={spotlightSize}
          lineHeight={lineHeight}
          spotlightSoftness={spotlightSoftness}
          textBlur={textBlur}
        />
      </Canvas>
    </div>
  );
}
