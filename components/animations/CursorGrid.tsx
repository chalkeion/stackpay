'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const CELL_SIZE = 40;
const DOT_RADIUS = 1.5;
const BASE_OPACITY = 0.15;
const GLOW_RADIUS = 150;
const GLOW_MAX_OPACITY = 0.9;
const BASE_COLOR = { r: 42, g: 42, b: 42 };
const ORANGE = { r: 241, g: 90, b: 34 };
const GLOW_COLOR = { r: 255, g: 120, b: 60 };

interface Swoosh {
  id: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
  position: number;
  speed: number;
  lineIndex: number;
  opacity: number;
  length: number;
}

export default function CursorGrid({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const swooshesRef = useRef<Swoosh[]>([]);
  const animIdRef = useRef<number>(0);
  const nextSwooshIdRef = useRef(0);
  const nextSwooshTimeRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas) return;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    }

    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      cursorRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    window.addEventListener('mousemove', onMouseMove);

    function spawnSwoosh() {
      if (swooshesRef.current.length >= 6) return;
      const dir = (['horizontal', 'vertical', 'diagonal'] as const)[
        Math.floor(Math.random() * 3)
      ];
      const cols = Math.floor(width / CELL_SIZE);
      const rows = Math.floor(height / CELL_SIZE);
      const lineIndex =
        dir === 'horizontal'
          ? Math.floor(Math.random() * rows)
          : Math.floor(Math.random() * cols);

      swooshesRef.current.push({
        id: nextSwooshIdRef.current++,
        direction: dir,
        position: -250,
        speed: 60 + Math.random() * 60,
        lineIndex,
        opacity: 0.8,
        length: 80 + Math.random() * 120,
      });
    }

    function drawSwoosh(swoosh: Swoosh) {
      if (!ctx) return;
      ctx.save();
      ctx.filter = 'blur(2px)';

      const trailColors = [
        { alpha: swoosh.opacity },
        { alpha: swoosh.opacity * 0.5 },
        { alpha: swoosh.opacity * 0.2 },
      ];

      const segments = [1, 0.6, 0.3];

      for (let t = 0; t < 3; t++) {
        const segLen = swoosh.length * segments[t];
        const trailOffset = t * (swoosh.length * 0.25);
        ctx.globalAlpha = trailColors[t].alpha;
        ctx.fillStyle = `rgb(${GLOW_COLOR.r}, ${GLOW_COLOR.g}, ${GLOW_COLOR.b})`;

        if (swoosh.direction === 'horizontal') {
          const y = swoosh.lineIndex * CELL_SIZE;
          const x = swoosh.position - segLen - trailOffset;
          ctx.fillRect(x, y - 1, segLen, 2);
        } else if (swoosh.direction === 'vertical') {
          const x = swoosh.lineIndex * CELL_SIZE;
          const y = swoosh.position - segLen - trailOffset;
          ctx.fillRect(x - 1, y, 2, segLen);
        } else {
          // diagonal — travel along both axes simultaneously
          const x = swoosh.position - segLen - trailOffset;
          const y = swoosh.lineIndex * CELL_SIZE + (swoosh.position - segLen - trailOffset) * 0.5;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.atan2(0.5, 1));
          ctx.fillRect(0, -1, segLen, 2);
          ctx.restore();
        }
      }

      ctx.filter = 'none';
      ctx.restore();
    }

    function draw(now: number) {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      const cursor = cursorRef.current;

      // Draw grid dots
      const cols = Math.floor(width / CELL_SIZE) + 1;
      const rows = Math.floor(height / CELL_SIZE) + 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * CELL_SIZE;
          const y = row * CELL_SIZE;
          const dist = Math.hypot(x - cursor.x, y - cursor.y);

          let r: number, g: number, b: number, opacity: number;

          if (dist < GLOW_RADIUS) {
            const t = 1 - dist / GLOW_RADIUS;
            opacity = BASE_OPACITY + (GLOW_MAX_OPACITY - BASE_OPACITY) * t;
            r = Math.round(BASE_COLOR.r + (ORANGE.r - BASE_COLOR.r) * t);
            g = Math.round(BASE_COLOR.g + (ORANGE.g - BASE_COLOR.g) * t);
            b = Math.round(BASE_COLOR.b + (ORANGE.b - BASE_COLOR.b) * t);
          } else {
            r = BASE_COLOR.r;
            g = BASE_COLOR.g;
            b = BASE_COLOR.b;
            opacity = BASE_OPACITY;
          }

          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
          ctx.fill();
        }
      }

      // Swoosh logic (disabled if reduced motion)
      if (!prefersReducedMotion) {
        if (now >= nextSwooshTimeRef.current) {
          spawnSwoosh();
          nextSwooshTimeRef.current = now + 2000 + Math.random() * 2000;
        }

        swooshesRef.current = swooshesRef.current.filter((s) => {
          const dim = s.direction === 'horizontal' ? width : height;
          return s.position < dim + s.length && s.opacity >= 0.02;
        });

        for (const swoosh of swooshesRef.current) {
          swoosh.position += swoosh.speed / 60;
          swoosh.opacity -= 0.003;
          drawSwoosh(swoosh);
        }
      }

      animIdRef.current = requestAnimationFrame(draw);
    }

    animIdRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      ro.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', inset: 0, opacity: 0.6, zIndex: 0, width: '100%', height: '100%' }}
    />
  );
}
