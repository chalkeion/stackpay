'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface LiquidFillProps {
  fillPercent: number;
  value: number;
  label?: string;
  width?: number;
  height?: number;
}

export default function LiquidFill({
  fillPercent,
  value,
  label = 'sBTC',
  width = 200,
  height = 200,
}: LiquidFillProps) {
  const [currentFill, setCurrentFill] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReduced = useReducedMotion();
  const animFrameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const WAVE_HEIGHT = 6;
  const radius = Math.min(width, height) / 2;

  useEffect(() => {
    const targetFill = Math.min(Math.max(fillPercent, 0), 100);
    const targetValue = value;
    const duration = prefersReduced ? 0 : 1500;

    if (prefersReduced) {
      setCurrentFill(targetFill);
      setDisplayValue(targetValue);
      return;
    }

    startTimeRef.current = performance.now();
    const startFill = currentFill;
    const startVal = displayValue;

    const animate = (now: number) => {
      const elapsed = now - (startTimeRef.current ?? now);
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);

      setCurrentFill(startFill + (targetFill - startFill) * ease);
      setDisplayValue(startVal + (targetValue - startVal) * ease);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillPercent, value]);

  // Build wave path
  const yBase = height - (currentFill / 100) * height;
  const wavePoints = Array.from({ length: width + 1 }, (_, x) => {
    const y = yBase + Math.sin((x / width) * Math.PI * 4) * WAVE_HEIGHT;
    return `${x},${y}`;
  }).join(' ');

  const clipId = `liquid-clip-${label.replace(/\s/g, '')}`;
  const gradId = `liquid-grad-${label.replace(/\s/g, '')}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <clipPath id={clipId}>
              <motion.path
                d={`M 0,${yBase} ${wavePoints} L ${width},${height} L 0,${height} Z`}
                animate={{
                  d: [
                    `M 0,${yBase} ${wavePoints} L ${width},${height} L 0,${height} Z`,
                    `M 0,${yBase + WAVE_HEIGHT} ${wavePoints} L ${width},${height} L 0,${height} Z`,
                    `M 0,${yBase} ${wavePoints} L ${width},${height} L 0,${height} Z`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </clipPath>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F15A22" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Container circle */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill="var(--bg-elevated)"
            stroke="var(--bg-border)"
            strokeWidth={2}
          />

          {/* Liquid fill clipped to circle */}
          <g clipPath={`url(#${clipId})`}>
            <circle cx={radius} cy={radius} r={radius - 2} fill={`url(#${gradId})`} />
          </g>

          {/* Border ring */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - 2}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.5}
            opacity={0.4}
          />

          {/* Center text */}
          <text
            x={radius}
            y={radius - 8}
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize={20}
            fontWeight="700"
            fontFamily="var(--font-syne)"
          >
            {displayValue.toFixed(5)}
          </text>
          <text
            x={radius}
            y={radius + 14}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize={11}
            fontFamily="var(--font-ibm-plex-mono)"
          >
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
}
