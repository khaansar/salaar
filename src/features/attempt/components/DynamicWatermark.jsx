'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../../../hooks/useAppSelector';

/**
 * Exam watermark
 * - Layer 1: one label that glides slowly between zones of the screen.
 * - Layer 2: a very faint static tile pattern, so cropping out the moving
 *   label in a screenshot still leaves the student's identity visible.
 * - Pauses while the tab is hidden, respects reduced motion, and restores
 *   its own styles if they are changed through dev tools.
 */

// Positions in viewport percentages. Spread over the whole screen.
const ZONES = [
  { x: 16, y: 18 }, { x: 50, y: 14 }, { x: 84, y: 18 },
  { x: 22, y: 38 }, { x: 50, y: 34 }, { x: 78, y: 40 },
  { x: 14, y: 60 }, { x: 46, y: 56 }, { x: 86, y: 62 },
  { x: 24, y: 84 }, { x: 54, y: 86 }, { x: 80, y: 84 },
];

const MIN_HOLD_MS = 9000;   // how long it rests at a spot (min)
const MAX_HOLD_MS = 15000;  // how long it rests at a spot (max)
const GLIDE_MS = 7000;      // how long one glide takes
const REDUCED_HOLD_MS = 30000;
const INTEGRITY_CHECK_MS = 2500;

const BASE_OPACITY = 0.2;
const TILE_OPACITY = 0.05;

const randomBetween = (min, max) => min + Math.random() * (max - min);

// Pick a zone that is not the current one and is far enough to feel like a real drift.
function pickNextZone(current) {
  const far = ZONES.filter((z) => Math.hypot(z.x - current.x, z.y - current.y) > 25);
  const pool = far.length ? far : ZONES;
  const zone = pool[Math.floor(Math.random() * pool.length)];
  // small jitter so the path is never exactly the same twice
  return {
    x: Math.min(92, Math.max(8, zone.x + randomBetween(-4, 4))),
    y: Math.min(92, Math.max(8, zone.y + randomBetween(-4, 4))),
  };
}

const escapeXml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildTile(label) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="220">` +
    `<text x="180" y="110" text-anchor="middle" transform="rotate(-24 180 110)" ` +
    `font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#334155">` +
    `${escapeXml(label)}</text></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export default function DynamicWatermark() {
  const user = useAppSelector((state) => state.auth.user);
  const attempt = useAppSelector((state) => state.attempt.attempt);

  const email = typeof user?.email === 'string' ? user.email.trim() : '';
  const isActiveAttempt = attempt?.status === 'IN_PROGRESS';
  const label = email;

  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [reducedMotion, setReducedMotion] = useState(false);

  const labelRef = useRef(null);
  const tileRef = useRef(null);
  const positionRef = useRef(position);
  positionRef.current = position;

  const tileImage = useMemo(() => (label ? buildTile(label) : ''), [label]);

  // Track the reduced-motion preference.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Slow drift loop. Uses a random hold time so the movement is not predictable.
  useEffect(() => {
    if (!label || !isActiveAttempt) return undefined;

    let timer;
    let stopped = false;

    const schedule = () => {
      const delay = reducedMotion
        ? REDUCED_HOLD_MS
        : randomBetween(MIN_HOLD_MS, MAX_HOLD_MS);

      timer = window.setTimeout(() => {
        if (stopped) return;
        if (!document.hidden) {
          setPosition((current) => pickNextZone(current));
        }
        schedule();
      }, delay);
    };

    // Start somewhere random, then begin drifting.
    setPosition(pickNextZone({ x: 50, y: 50 }));
    schedule();

    // Re-place gently when the layout really changes, not on every resize tick.
    let resizeTimer;
    const handleViewportChange = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(
        () => setPosition((current) => pickNextZone(current)),
        400
      );
    };

    window.addEventListener('resize', handleViewportChange);
    document.addEventListener('fullscreenchange', handleViewportChange);

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleViewportChange);
      document.removeEventListener('fullscreenchange', handleViewportChange);
    };
  }, [label, isActiveAttempt, reducedMotion]);

  // Integrity check: if someone hides or fades the watermark via dev tools,
  // put the important styles back.
  useEffect(() => {
    if (!label || !isActiveAttempt) return undefined;

    const enforce = () => {
      [labelRef.current, tileRef.current].forEach((node) => {
        if (!node) return;
        const computed = window.getComputedStyle(node);
        const expected = node === labelRef.current ? BASE_OPACITY : TILE_OPACITY;
        const hidden =
          computed.display === 'none' ||
          computed.visibility !== 'visible' ||
          parseFloat(computed.opacity) < expected * 0.6;

        if (hidden) {
          node.style.setProperty('display', node.dataset.display, 'important');
          node.style.setProperty('visibility', 'visible', 'important');
          node.style.setProperty('opacity', String(expected), 'important');
        }
      });
    };

    const interval = window.setInterval(enforce, INTEGRITY_CHECK_MS);
    return () => window.clearInterval(interval);
  }, [label, isActiveAttempt]);

  if (!label || !isActiveAttempt) return null;

  return (
    <>
      {/* Layer 2: faint static tiles across the whole screen */}
      <div
        ref={tileRef}
        data-display="block"
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[34] select-none"
        style={{
          display: 'block',
          opacity: TILE_OPACITY,
          backgroundImage: tileImage,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Layer 1: slow-moving label */}
      <div
        ref={labelRef}
        data-display="block"
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[35] select-none"
        style={{
          display: 'block',
          // transform is GPU-composited, so the glide stays smooth and cheap
          transform: `translate3d(${position.x}vw, ${position.y}vh, 0) translate(-50%, -50%)`,
          transition: reducedMotion
            ? 'none'
            : `transform ${GLIDE_MS}ms cubic-bezier(0.45, 0, 0.25, 1)`,
          willChange: 'transform',
          maxWidth: '80vw',
          overflowWrap: 'anywhere',
          textAlign: 'center',
          opacity: BASE_OPACITY,
          color: '#334155',
          fontSize: 'clamp(11px, 1.1vw, 15px)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          padding: '5px 10px',
          borderRadius: '4px',
          // readable on both light and dark content behind it
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          textShadow:
            '0 0 2px rgba(255, 255, 255, 0.45), 0 1px 1px rgba(15, 23, 42, 0.25)',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {label}
      </div>
    </>
  );
}