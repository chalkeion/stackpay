'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePageTransition } from '@/context/TransitionContext';
import { useWalletContext } from '@/context/WalletContext';

// ── constants ────────────────────────────────────────────────────────────────

const TILE = 24;

// 14 shockwave rings with staggered delays, sizes, and opacities
const RINGS = Array.from({ length: 14 }, (_, i) => ({
  delay: i * 0.035 + (i % 3 === 0 ? 0.02 : 0),
  duration: 0.55 + (i % 4) * 0.06,
  strokeWidth: Math.max(0.3, 3.2 - i * 0.22),
  opacity: 0.85 - i * 0.045,
}));

// ── canvas dissolve ──────────────────────────────────────────────────────────

function initTileDelays(cols: number, rows: number): Float32Array {
  const arr = new Float32Array(cols * rows);
  for (let i = 0; i < arr.length; i++) arr[i] = Math.random() * 200;
  return arr;
}

function drawDissolve(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  delays: Float32Array,
  elapsed: number,
): boolean {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let anyVisible = false;
  const FADE = 260;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const d = delays[r * cols + c];
      const alpha = 1 - Math.max(0, Math.min(1, (elapsed - d) / FADE));
      if (alpha > 0.01) {
        ctx.fillStyle = `rgba(241,90,34,${alpha.toFixed(3)})`;
        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
        anyVisible = true;
      }
    }
  }
  return anyVisible;
}

// ── main component ───────────────────────────────────────────────────────────

export function DashboardTransition() {
  const { activeTransition, origin, completeTransition } = usePageTransition();
  const { disconnect } = useWalletContext();
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tileDelaysRef = useRef<Float32Array | null>(null);

  const [showRings, setShowRings] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [showAmbient, setShowAmbient] = useState(false);
  const [maxRadius, setMaxRadius] = useState(2000);

  // ── connect transition ─────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTransition !== 'connect') return;

    const diag = Math.ceil(
      Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2),
    ) + 200;
    setMaxRadius(diag);
    setShowRings(true);

    const t1 = setTimeout(() => {
      setShowFlash(true);
    }, 600);

    const t2 = setTimeout(() => {
      setShowFlash(false);
      setShowRings(false);
      setShowCanvas(true);
    }, 650);

    const t3 = setTimeout(() => {
      setShowAmbient(true);
    }, 2050);

    const t4 = setTimeout(() => {
      setShowAmbient(false);
      completeTransition();
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      cancelAnimationFrame(rafRef.current);
    };
  }, [activeTransition, completeTransition]);

  // Start canvas dissolve once canvas is mounted
  const startDissolve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const cols = Math.ceil(W / TILE);
    const rows = Math.ceil(H / TILE);
    tileDelaysRef.current = initTileDelays(cols, rows);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill solid orange before starting dissolve
    ctx.fillStyle = '#F15A22';
    ctx.fillRect(0, 0, W, H);

    const startTime = performance.now();

    function frame() {
      if (!ctx) return;
      const elapsed = performance.now() - startTime;
      const stillVisible = drawDissolve(ctx, cols, rows, tileDelaysRef.current!, elapsed);
      if (stillVisible) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        // Dissolve complete — hide canvas
        setShowCanvas(false);
      }
    }

    // Short delay so React can mount the canvas before we start drawing
    setTimeout(() => requestAnimationFrame(frame), 30);
  }, []);

  useEffect(() => {
    if (showCanvas) startDissolve();
    return () => cancelAnimationFrame(rafRef.current);
  }, [showCanvas, startDissolve]);

  // ── boot transition ────────────────────────────────────────────────────────
  const [showScanline, setShowScanline] = useState(false);
  const [showBlackScreen, setShowBlackScreen] = useState(false);

  useEffect(() => {
    if (activeTransition !== 'boot') return;

    setShowBlackScreen(true);
    setShowScanline(true);

    const t1 = setTimeout(() => setShowScanline(false), 220);
    const t2 = setTimeout(() => {
      setShowBlackScreen(false);
      completeTransition();
    }, 420);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeTransition, completeTransition]);

  // ── disconnect transition ──────────────────────────────────────────────────
  const [showImplode, setShowImplode] = useState(false);

  useEffect(() => {
    if (activeTransition !== 'disconnect') return;

    // Disconnect wallet state immediately
    disconnect();
    setShowImplode(true);

    // Navigate once screen is fully dark (300ms)
    const t1 = setTimeout(() => {
      router.push('/');
    }, 320);

    // End animation
    const t2 = setTimeout(() => {
      setShowImplode(false);
      completeTransition();
    }, 750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeTransition, completeTransition, disconnect, router]);

  const isActive = activeTransition !== null;

  return (
    <AnimatePresence>
      {isActive && (
        <div
          key="transition-root"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {/* ── CONNECT Phase 1: SVG shockwave rings ── */}
          {showRings && (
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                overflow: 'visible',
              }}
            >
              {RINGS.map((ring, i) => (
                <motion.circle
                  key={i}
                  cx={origin.x}
                  cy={origin.y}
                  r={0}
                  fill="none"
                  stroke="#F15A22"
                  strokeWidth={ring.strokeWidth}
                  initial={{ r: 0, opacity: ring.opacity, strokeWidth: ring.strokeWidth }}
                  animate={{ r: maxRadius, opacity: 0, strokeWidth: 0 }}
                  transition={{
                    duration: ring.duration,
                    delay: ring.delay,
                    ease: [0.2, 0, 0.4, 1] as [number, number, number, number],
                  }}
                />
              ))}
            </svg>
          )}

          {/* ── CONNECT Phase 2: Orange flash ── */}
          <AnimatePresence>
            {showFlash && (
              <motion.div
                key="flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.025 }}
                style={{ position: 'absolute', inset: 0, background: '#F15A22' }}
              />
            )}
          </AnimatePresence>

          {/* ── CONNECT Phase 3: Canvas pixel dissolve ── */}
          {showCanvas && (
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', inset: 0, display: 'block' }}
            />
          )}

          {/* ── CONNECT Phase 5: Ambient settle pulse ── */}
          <AnimatePresence>
            {showAmbient && (
              <motion.div
                key="ambient"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.55, times: [0, 0.4, 1] }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(241,90,34,0.22) 0%, transparent 65%)',
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>

          {/* ── BOOT: black screen + scanline ── */}
          <AnimatePresence>
            {showBlackScreen && (
              <motion.div
                key="boot-black"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ position: 'absolute', inset: 0, background: '#0D0D0D' }}
              >
                {showScanline && (
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 0.2, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: 3,
                      background:
                        'linear-gradient(90deg, transparent, #F15A22 30%, #F15A22 70%, transparent)',
                      boxShadow: '0 0 24px #F15A22, 0 0 8px #F15A22',
                    }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── DISCONNECT: implode ── */}
          <AnimatePresence>
            {showImplode && (
              <motion.div
                key="implode"
                initial={{ opacity: 0, scale: 1 }}
                animate={{
                  opacity: [0, 0.92, 0.92, 0.92, 0],
                  scale: [1, 1, 1, 0.04, 0],
                }}
                transition={{
                  duration: 0.75,
                  times: [0, 0.28, 0.45, 0.85, 1],
                  ease: 'easeIn',
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#0D0D0D',
                  transformOrigin: 'center center',
                }}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
