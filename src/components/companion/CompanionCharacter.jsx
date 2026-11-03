const HOODIE_DARK = '#3b2a9e';
const SKIN_SHADE = '#e0a678';
const SHOE = '#334155';

function Defs() {
  return (
    <defs>
      <linearGradient id="kalki-skin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fddcbb" />
        <stop offset="1" stopColor="#eab78c" />
      </linearGradient>
      <linearGradient id="kalki-hoodie" gradientUnits="userSpaceOnUse" x1="30" y1="55" x2="100" y2="135">
        <stop offset="0" stopColor="#8672f9" />
        <stop offset="1" stopColor="#5e43f3" />
      </linearGradient>
      <linearGradient id="kalki-denim" gradientUnits="userSpaceOnUse" x1="42" y1="0" x2="88" y2="0">
        <stop offset="0" stopColor="#35659c" />
        <stop offset="1" stopColor="#274e7c" />
      </linearGradient>
      <linearGradient id="kalki-hair" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4a3226" />
        <stop offset="1" stopColor="#241710" />
      </linearGradient>
      <linearGradient id="kalki-bag" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#526279" />
        <stop offset="1" stopColor="#334155" />
      </linearGradient>
      <radialGradient id="kalki-iris" cx="0.5" cy="0.4" r="0.6">
        <stop offset="0" stopColor="#7a4a2b" />
        <stop offset="1" stopColor="#2c1a10" />
      </radialGradient>
    </defs>
  );
}

function SideArm({ near }) {
  const sleeve = near ? 'url(#kalki-hoodie)' : HOODIE_DARK;

  return (
    <g className={`companion-arm ${near ? 'companion-near' : 'companion-far'}`}>
      <path d="M58 74v30" stroke={sleeve} strokeWidth="14" strokeLinecap="round" />
      <g className="companion-forearm">
        <path d="M58 104v24" stroke={sleeve} strokeWidth="12" strokeLinecap="round" />
        <path d="M52 130h12" stroke={HOODIE_DARK} strokeWidth="5" strokeLinecap="round" />
        <circle cx="58" cy="138" r="6.5" fill={near ? 'url(#kalki-skin)' : SKIN_SHADE} />
      </g>
    </g>
  );
}

function SideLeg({ near }) {
  const denim = near ? 'url(#kalki-denim)' : '#1e3a5f';

  return (
    <g className={`companion-thigh ${near ? 'companion-near' : 'companion-far'}`}>
      <path d="M62 112v34" stroke={denim} strokeWidth="18" strokeLinecap="round" />
      <g className="companion-shin">
        <path d="M62 146v32" stroke={denim} strokeWidth="15" strokeLinecap="round" />
        <g className="companion-foot">
          <path d="M53 178c0-3 3-5 6-5h8c3 0 5 2 6 4 6 2 13 5 14 10 0 4-2 5-5 5H56c-3 0-4-2-4-4z" fill={SHOE} />
          <path d="M52 188h35c0 3-2 5-5 5H56c-3 0-4-2-4-5z" fill="#f1f5f9" />
          <path d="M67 177l5 4M72 178l4 4" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

function Blink({ eyes }) {
  return (
    <g className="companion-eyelids">
      {eyes.map(([cx, rx]) => (
        <ellipse key={cx} cx={cx} cy="33" rx={rx + 0.5} ry="7" fill="#f3c7a0" />
      ))}
    </g>
  );
}

function SideHead() {
  return (
    <g className="companion-head">
      <path d="M58 48h16v12c-5 3-11 3-16 0z" fill={SKIN_SHADE} />
      <path d="M41 30c0-16 11-27 27-27s27 11 27 27c0 15-10 29-27 29S41 45 41 30z" fill="url(#kalki-skin)" />
      <path d="M93 33c3 1 5 3 4 6-1 2-3 3-6 3z" fill={SKIN_SHADE} />
      <ellipse cx="46" cy="36" rx="5" ry="7" fill={SKIN_SHADE} />
      <path d="M44 33c2 1 3 3 3 6" stroke="#b97f55" strokeWidth="1.2" fill="none" />
      <ellipse cx="74" cy="43" rx="5.5" ry="3.5" fill="#fb7185" opacity="0.3" />

      <ellipse cx="69" cy="33" rx="5.2" ry="6.2" fill="#ffffff" />
      <ellipse cx="85" cy="33" rx="4.2" ry="5.8" fill="#ffffff" />
      <circle cx="71" cy="33.5" r="3.8" fill="url(#kalki-iris)" />
      <circle cx="86.5" cy="33.5" r="3.3" fill="url(#kalki-iris)" />
      <circle cx="72.4" cy="31.8" r="1.3" fill="#ffffff" />
      <circle cx="87.6" cy="31.8" r="1.1" fill="#ffffff" />
      <Blink eyes={[[69, 5.2], [85, 4.2]]} />
      <path d="M63 23c4-2 8-2 12 0M80 22c3-1 7-1 9 1" stroke="#2c1a10" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M80 50c3 3 7 3 10 0" stroke="#a8503c" strokeWidth="2" fill="none" strokeLinecap="round" />

      <path
        d="M39 37C34 14 50 0 68 1c11 0 20 4 25 12 2 3 3 8 3 11-4-4-8-6-13-6l2-5c-5 4-11 6-17 6l2-5c-5 4-11 6-16 7-2 4-3 9-3 14-3 3-8 4-12 2z"
        fill="url(#kalki-hair)"
      />
      <path d="M52 9c8-4 19-4 27 0M47 17c2-3 4-5 7-6" stroke="#6f5240" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  );
}

function SidePose({ facing, mood }) {
  return (
    <g className={facing < 0 ? 'companion-flipped' : ''}>
      <g className={mood === 'run' ? 'companion-body companion-running' : 'companion-body'}>
        <SideArm near={false} />
        <SideLeg near={false} />

        <path d="M20 76c0-8 6-14 14-14h14v54H34c-8 0-14-6-14-14z" fill="url(#kalki-bag)" />
        <path d="M23 92h24v16c0 3-2 5-5 5H31c-4 0-8-4-8-8z" fill="#3f4c5f" />
        <path d="M29 98h13" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M33 62c2-6 8-9 14-9" stroke="#334155" strokeWidth="4" fill="none" strokeLinecap="round" />

        <SideLeg near />

        <path d="M43 76c0-11 8-18 18-18h4c11 0 18 7 18 18l1 34c0 3-2 6-5 6H47c-3 0-5-3-5-6z" fill="url(#kalki-hoodie)" />
        <path d="M43 62c3-7 10-10 18-10l-4 12c-5 1-10 1-14-2z" fill={HOODIE_DARK} opacity="0.8" />
        <path d="M54 92h25v13c0 2-2 4-4 4H58c-2 0-4-2-4-4z" fill={HOODIE_DARK} opacity="0.3" />
        <path d="M42 110h42v4c0 2-2 3-4 3H46c-2 0-4-1-4-3z" fill={HOODIE_DARK} />
        <path d="M59 58c-2 14-2 34 1 50" stroke="#334155" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M56 54c5 6 15 6 21 0l3 7c-8 6-19 6-27 0z" fill={HOODIE_DARK} />

        <SideArm near />
        <SideHead />
      </g>
    </g>
  );
}

function FrontArm({ side }) {
  const x = side === 'left' ? 38 : 92;
  const lean = side === 'left' ? -2 : 2;

  return (
    <g className={`companion-front-arm-${side}`}>
      <path d={`M${x} 72l${lean} 24`} stroke="url(#kalki-hoodie)" strokeWidth="14" strokeLinecap="round" />
      <g className={`companion-front-forearm-${side}`}>
        <path d={`M${x + lean} 96v20`} stroke="url(#kalki-hoodie)" strokeWidth="12" strokeLinecap="round" />
        <path d={`M${x + lean - 6} 119h12`} stroke={HOODIE_DARK} strokeWidth="5" strokeLinecap="round" />
        <circle cx={x + lean} cy="127" r="6.5" fill="url(#kalki-skin)" />
      </g>
    </g>
  );
}

function FrontLegs() {
  return (
    <g className="companion-front-legs">
      <path d="M54 120l-2 58" stroke="url(#kalki-denim)" strokeWidth="17" strokeLinecap="round" />
      <path d="M76 120l2 58" stroke="url(#kalki-denim)" strokeWidth="17" strokeLinecap="round" />
      <path d="M41 188c0-6 4-10 10-10h4c6 0 8 3 8 8v5H44c-2 0-3-1-3-3z" fill={SHOE} />
      <path d="M67 186c0-5 2-8 8-8h4c6 0 10 4 10 10 0 2-1 3-3 3H67z" fill={SHOE} />
      <path d="M41 188h22v3c0 2-1 3-3 3H45c-3 0-4-2-4-6zM67 188h22c0 4-1 6-4 6H70c-2 0-3-1-3-3z" fill="#f1f5f9" />
      <path d="M49 182h8M73 182h8" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function Mouth({ mood }) {
  if (mood === 'angry') {
    return <path d="M56 50c5-4 13-4 18 0" stroke="#8f3b2c" strokeWidth="2.4" fill="none" strokeLinecap="round" />;
  }
  if (mood === 'think') {
    return <path d="M60 48c4 1 8 0 11-2" stroke="#a8503c" strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
  if (mood === 'wave' || mood === 'jump') {
    return (
      <g>
        <path d="M55 44c6 3 14 3 20 0-1 7-5 10-10 10s-9-3-10-10z" fill="#7f2d2d" />
        <path d="M60 51c3 2 7 2 10 0-2 3-8 3-10 0z" fill="#fb7185" />
        <path d="M56 45c6 2 12 2 18 0v2c-6 2-12 2-18 0z" fill="#ffffff" />
      </g>
    );
  }
  return <path d="M56 46c5 5 13 5 18 0" stroke="#a8503c" strokeWidth="2.2" fill="none" strokeLinecap="round" />;
}

function Brows({ mood }) {
  if (mood === 'angry') {
    return <path d="M46 23l15 6M84 23l-15 6" stroke="#2c1a10" strokeWidth="3.4" fill="none" strokeLinecap="round" />;
  }
  if (mood === 'think') {
    return <path d="M47 24c4-2 9-2 13 0M70 18c4-3 9-3 13 0" stroke="#2c1a10" strokeWidth="2.8" fill="none" strokeLinecap="round" />;
  }
  return <path d="M47 23c4-3 9-3 13 0M70 23c4-3 9-3 13 0" stroke="#2c1a10" strokeWidth="2.8" fill="none" strokeLinecap="round" />;
}

function Eyes({ mood }) {
  if (mood === 'jump') {
    return (
      <path d="M48 35c3-5 9-5 12 0M70 35c3-5 9-5 12 0" stroke="#2c1a10" strokeWidth="2.8" fill="none" strokeLinecap="round" />
    );
  }

  return (
    <g>
      <ellipse cx="54" cy="33" rx="6" ry="6.8" fill="#ffffff" />
      <ellipse cx="76" cy="33" rx="6" ry="6.8" fill="#ffffff" />
      <g className="companion-pupils">
        <circle cx="54" cy="33.5" r="4" fill="url(#kalki-iris)" />
        <circle cx="76" cy="33.5" r="4" fill="url(#kalki-iris)" />
        <circle cx="55.5" cy="31.8" r="1.4" fill="#ffffff" />
        <circle cx="77.5" cy="31.8" r="1.4" fill="#ffffff" />
      </g>
      <Blink eyes={[[54, 6], [76, 6]]} />
      <path d="M48 29c3-3 9-3 12 0M70 29c3-3 9-3 12 0" stroke="#2c1a10" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  );
}

function FrontHead({ mood }) {
  return (
    <g className="companion-front-head">
      <path d="M57 50h16v12c-5 3-11 3-16 0z" fill={SKIN_SHADE} />
      <ellipse cx="38" cy="36" rx="5" ry="7" fill={SKIN_SHADE} />
      <ellipse cx="92" cy="36" rx="5" ry="7" fill={SKIN_SHADE} />
      <path d="M38 30c0-16 11-28 27-28s27 12 27 28c0 17-11 30-27 30S38 47 38 30z" fill="url(#kalki-skin)" />
      {mood === 'angry' && (
        <path className="companion-flush" d="M38 30c0-16 11-28 27-28s27 12 27 28c0 17-11 30-27 30S38 47 38 30z" fill="#ef4444" />
      )}
      <ellipse cx="47" cy="44" rx="5.5" ry="3.5" fill="#fb7185" opacity="0.3" />
      <ellipse cx="83" cy="44" rx="5.5" ry="3.5" fill="#fb7185" opacity="0.3" />

      <Eyes mood={mood} />
      <Brows mood={mood} />
      <path d="M62 40c1 2 5 2 6 0" stroke="#c98d62" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <Mouth mood={mood} />

      <path
        d="M36 36C31 13 47-1 65 0c18-1 34 13 29 36-2-3-3-8-4-12-4 1-9 0-13-3l1 4c-5 0-11-2-14-6-3 4-8 7-14 7l2-4c-3 1-6 3-8 5-2 3-4 6-8 9z"
        fill="url(#kalki-hair)"
      />
      <path d="M50 8c9-4 21-4 30 0M44 16c2-3 4-5 6-6" stroke="#6f5240" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  );
}

function ThoughtBubble() {
  return (
    <g className="companion-thought">
      <circle cx="97" cy="6" r="3" fill="#ffffff" stroke="#cbd5e1" />
      <circle cx="104" cy="-3" r="4.5" fill="#ffffff" stroke="#cbd5e1" />
      <path d="M100-14c-4-9 7-15 13-10 6-6 17-1 15 7 6 5 1 14-7 12-5 5-15 3-16-3-3 0-5-3-5-6z" fill="#ffffff" stroke="#cbd5e1" />
      <text x="114" y="-9" textAnchor="middle" fontSize="15" fontWeight="700" fill="#5e43f3">?</text>
    </g>
  );
}

function Steam() {
  return (
    <g fill="#94a3b8">
      <circle className="companion-steam" cx="30" cy="26" r="4" />
      <circle className="companion-steam companion-steam-late" cx="100" cy="26" r="4" />
      <path d="M100 2l5 6M108 0l-2 9M112 8l-7 2" stroke="#ef4444" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  );
}

function Sparkles() {
  return (
    <g fill="#f59e0b" className="companion-sparkles">
      <path d="M22 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
      <path d="M108 8l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
    </g>
  );
}

function FrontPose({ mood }) {
  return (
    <g className={`companion-front companion-mood-${mood}`}>
      <FrontLegs />
      <g className="companion-front-body">
        <path d="M44 72c0-10 8-16 18-16h6c10 0 18 6 18 16l1 44c0 3-2 6-5 6H48c-3 0-5-3-5-6z" fill="url(#kalki-hoodie)" />
        <path d="M52 96h26v14c0 2-2 4-4 4H56c-2 0-4-2-4-4z" fill={HOODIE_DARK} opacity="0.3" />
        <path d="M43 116h44v3c0 2-2 4-5 4H48c-3 0-5-2-5-4z" fill={HOODIE_DARK} />
        <path d="M50 58c-2 8-3 22-3 34M80 58c2 8 3 22 3 34" stroke="#334155" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M51 54c8 8 20 8 28 0l3 8c-9 7-25 7-34 0z" fill={HOODIE_DARK} />
        <path d="M61 66v9M69 66v9" stroke="#e8e4ff" strokeWidth="1.6" strokeLinecap="round" />
        <FrontHead mood={mood} />
        <FrontArm side="left" />
        <FrontArm side="right" />
        {mood === 'think' && <ThoughtBubble />}
        {mood === 'angry' && <Steam />}
        {mood === 'jump' && <Sparkles />}
      </g>
    </g>
  );
}

export default function CompanionCharacter({ mood = 'attentive', facing = 1 }) {
  const moving = mood === 'walk' || mood === 'run';

  return (
    <svg viewBox="0 0 130 206" className="companion-figure block h-auto" aria-hidden="true">
      <Defs />
      <ellipse
        className={mood === 'jump' ? 'companion-shadow companion-shadow-jump' : 'companion-shadow'}
        cx="65"
        cy="198"
        rx="36"
        ry="5"
        fill="#0f172a"
        opacity="0.22"
      />
      {moving ? <SidePose facing={facing} mood={mood} /> : <FrontPose mood={mood} />}
    </svg>
  );
}
