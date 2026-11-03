'use client';

import CompanionCharacter from './CompanionCharacter';
import { useCompanionMotion } from './useCompanionMotion';

export default function CompanionWalker({ stopped, leaving, onLeft, children }) {
  const { walkerRef, mood, facing } = useCompanionMotion(stopped);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-52 overflow-hidden">
      <div ref={walkerRef} className="absolute bottom-0 left-0 w-fit will-change-transform">
        {children}
        <div
          className={`flex justify-center ${leaving ? 'companion-fade' : ''}`}
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
