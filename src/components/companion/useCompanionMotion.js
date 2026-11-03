import { useEffect, useRef, useState } from 'react';

const ACTIONS = [
  { mood: 'walk', weight: 6, speed: 52, minMs: 4000, maxMs: 10000 },
  { mood: 'run', weight: 2, speed: 135, minMs: 1800, maxMs: 3500 },
  { mood: 'think', weight: 2, minMs: 3000, maxMs: 6000 },
  { mood: 'angry', weight: 1, minMs: 2500, maxMs: 4000 },
  { mood: 'wave', weight: 2, minMs: 2500, maxMs: 4000 },
  { mood: 'look', weight: 2, minMs: 2500, maxMs: 5000 },
  { mood: 'jump', weight: 1, minMs: 1800, maxMs: 3000 },
];
const TURN_CHANCE = 0.3;
const MAX_FRAME_MS = 100;
const RESTING_RIGHT_GAP = 24;

const randomBetween = (min, max) => min + Math.random() * (max - min);

function pickAction(previous) {
  const options = ACTIONS.filter((action) => action.mood !== previous.mood);
  const total = options.reduce((sum, action) => sum + action.weight, 0);
  let roll = Math.random() * total;
  const picked = options.find((action) => {
    roll -= action.weight;
    return roll <= 0;
  });
  return picked ?? options[0];
}

export function useCompanionMotion(stopped) {
  const walkerRef = useRef(null);
  const motion = useRef({ x: null, direction: 1, action: ACTIONS[0] });
  const [mood, setMood] = useState(ACTIONS[0].mood);
  const [facing, setFacing] = useState(1);

  useEffect(() => {
    const walker = walkerRef.current;
    if (!walker) return undefined;

    const state = motion.current;
    const furthest = () => Math.max(0, window.innerWidth - walker.offsetWidth);
    const place = () => {
      walker.style.transform = `translateX(${state.x}px)`;
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      state.x = Math.max(0, furthest() - RESTING_RIGHT_GAP);
      place();
      return undefined;
    }

    if (state.x === null) state.x = randomBetween(0, furthest());
    place();
    if (stopped) return undefined;

    const face = (direction) => {
      state.direction = direction;
      setFacing(direction);
    };

    let timer;
    const begin = () => {
      const action = pickAction(state.action);
      state.action = action;
      if (Math.random() < TURN_CHANCE) face(-state.direction);
      setMood(action.mood);
      timer = setTimeout(begin, randomBetween(action.minMs, action.maxMs));
    };
    timer = setTimeout(begin, randomBetween(state.action.minMs, state.action.maxMs));

    let frame;
    let last = performance.now();
    const step = (now) => {
      const elapsed = Math.min(now - last, MAX_FRAME_MS);
      last = now;
      const { speed = 0 } = state.action;
      const limit = furthest();
      const next = state.x + (state.direction * speed * elapsed) / 1000;
      state.x = Math.min(limit, Math.max(0, next));
      if (speed && (next <= 0 || next >= limit)) face(next <= 0 ? 1 : -1);
      place();
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [stopped]);

  return { walkerRef, mood, facing };
}
