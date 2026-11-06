'use client';

import CompanionCharacter from './CompanionCharacter';
import { useCompanionMotion } from './useCompanionMotion';

export default function CompanionWalker({ stopped, leaving, onLeft, overlay, onHoverChange, children }) {
  const { walkerRef, mood, facing } = useCompanionMotion(stopped);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-52 overflow-hidden">
      <div
        ref={walkerRef}
        className="group absolute bottom-0 left-0 w-fit will-change-transform"
        onMouseEnter={() => onHoverChange?.(true)}
        onMouseLeave={() => onHoverChange?.(false)}
        onFocus={() => onHoverChange?.(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) onHoverChange?.(false);
        }}
      >
        {overlay}
        {children}
        <div
          className={`pointer-events-auto flex justify-center ${leaving ? 'companion-fade' : ''}`}
          onAnimationEnd={(event) => {
            if (event.animationName === 'companion-fade') onLeft();
          }}
        >
          <CompanionCharacter mood={stopped ? 'attentive' : mood} facing={facing} />
        </div>
      </div>
    </div>
  );
}
