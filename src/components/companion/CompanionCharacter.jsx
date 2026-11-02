function Arm({ near }) {
  const skin = near ? 'url(#kalki-skin)' : '#d9a074';
  const sleeve = near ? 'url(#kalki-hoodie)' : '#c2410c';

  return (
    <g className={`companion-arm ${near ? 'companion-near' : 'companion-far'}`}>
      <path d="M52 70c-3 0-6 2-6 6l1 26c0 3 3 5 6 5h6c3 0 5-2 5-5l-1-26c0-4-4-6-11-6z" fill={sleeve} />
      <g className="companion-forearm">
        <path d="M48 104l2 25c0 3 3 5 6 5h3c3 0 5-2 5-5l-1-25c0-2-2-4-4-4h-7c-3 0-4 2-4 4z" fill={sleeve} />
        <rect x="49" y="128" width="15" height="6" rx="3" fill="#9a3412" />
        <path d="M50 134c0 8 3 13 7 13s7-5 7-13z" fill={skin} />
      </g>
    </g>
  );
}

function Leg({ near }) {
  const denim = near ? 'url(#kalki-denim)' : '#1e3a5f';
  const shoe = near ? '#475569' : '#334155';

  return (
    <g className={`companion-thigh ${near ? 'companion-near' : 'companion-far'}`}>
      <path d="M49 110c0-5 4-8 10-8h4c6 0 9 4 9 9l-3 32c0 3-2 5-5 5h-8c-3 0-5-2-5-5z" fill={denim} />
      <g className="companion-shin">
        <path d="M51 144c0-2 2-4 4-4h11c3 0 4 2 4 4l-3 33c0 2-2 3-4 3h-8c-2 0-3-1-3-3z" fill={denim} />
        <g className="companion-foot">
          <path d="M51 176h17l1 4c6 1 13 3 15 7 1 3-1 5-4 5H53c-3 0-4-2-4-4z" fill={shoe} />
          <path d="M49 188c0 3 2 4 4 4h27c3 0 5-2 4-5-10 2-24 2-35 1z" fill="#f1f5f9" />
          <path d="M60 178l5 4M64 177l5 4" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

export default function CompanionCharacter() {
  return (
    <svg
      viewBox="0 0 130 206"
      className="companion-figure block h-auto"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="kalki-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbd9b5" />
          <stop offset="1" stopColor="#e3aa7d" />
        </linearGradient>
        <linearGradient id="kalki-hoodie" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="kalki-denim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f5d91" />
          <stop offset="1" stopColor="#254a75" />
        </linearGradient>
        <linearGradient id="kalki-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2a20" />
          <stop offset="1" stopColor="#1f1510" />
        </linearGradient>
        <linearGradient id="kalki-bag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>

      <ellipse className="companion-shadow" cx="62" cy="198" rx="36" ry="5" fill="#0f172a" opacity="0.22" />

      <g className="companion-body">
        <Arm near={false} />
        <Leg near={false} />

        <path d="M22 72c0-6 5-10 11-10h14v50H35c-8 0-13-5-13-13z" fill="url(#kalki-bag)" />
        <path d="M25 86h20v15c0 2-2 4-4 4H31c-3 0-6-3-6-6z" fill="#0d9488" />
        <path d="M30 90h12" stroke="#ccfbf1" strokeWidth="1.5" strokeLinecap="round" />

        <Leg near />

        <path d="M43 72c0-9 7-15 16-15h6c10 0 17 6 17 15l1 36c0 3-2 5-5 5H47c-3 0-5-2-5-5z" fill="url(#kalki-hoodie)" />
        <path d="M51 90h24v12c0 2-2 4-4 4H55c-2 0-4-2-4-4z" fill="#c2410c" opacity="0.45" />
        <path d="M43 109h40v4c0 2-2 3-4 3H47c-2 0-4-1-4-3z" fill="#9a3412" />
        <path d="M60 58c-2 14-2 34 1 52" stroke="#0f766e" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M56 54c5 6 15 6 21 0l2 7c-7 6-18 6-25 0z" fill="#c2410c" />

        <Arm near />

        <g className="companion-head">
          <path d="M56 46h15v13c-5 3-10 3-15 0z" fill="#d9a074" />
          <ellipse cx="67" cy="32" rx="24" ry="25" fill="url(#kalki-skin)" />
          <path d="M90 31c3 1 5 3 4 6-1 2-3 3-6 3z" fill="#e3aa7d" />
          <ellipse cx="49" cy="35" rx="5" ry="7" fill="#e3aa7d" />
          <path d="M47 32c2 1 3 3 3 6" stroke="#b97f55" strokeWidth="1.2" fill="none" />

          <ellipse cx="75" cy="41" rx="5" ry="3.5" fill="#fb7185" opacity="0.28" />

          <ellipse cx="70" cy="31" rx="4.8" ry="5.5" fill="#ffffff" />
          <ellipse cx="85" cy="31" rx="3.8" ry="5.2" fill="#ffffff" />
          <circle cx="71.5" cy="31.5" r="3.3" fill="#3f2a1d" />
          <circle cx="86" cy="31.5" r="2.9" fill="#3f2a1d" />
          <circle cx="72.6" cy="30" r="1.1" fill="#ffffff" />
          <circle cx="87" cy="30" r="0.9" fill="#ffffff" />
          <g className="companion-eyelids">
            <ellipse cx="70" cy="31" rx="5.3" ry="6" fill="#efc299" />
            <ellipse cx="85" cy="31" rx="4.3" ry="5.7" fill="#efc299" />
          </g>

          <path d="M64 23c4-2 8-2 11 0M81 22c3-1 6-1 8 1" stroke="#2b1c14" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M79 47c3 3 7 3 10 0" stroke="#a8503c" strokeWidth="2" fill="none" strokeLinecap="round" />

          <path
            d="M43 34c-3-18 8-31 25-31 15 0 25 8 26 20-5-5-12-7-19-6-4 3-11 5-16 5-3 2-5 5-6 12-4 3-8 3-10 0z"
            fill="url(#kalki-hair)"
          />
          <path d="M56 9c7-3 15-3 22 0" stroke="#5b4334" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
