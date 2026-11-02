export default function CompanionCharacter() {
  return (
    <svg viewBox="0 0 48 64" width="48" height="64" aria-hidden="true">
      <g className="companion-leg">
        <rect x="17" y="46" width="6" height="14" rx="3" fill="#334155" />
        <ellipse cx="20" cy="60" rx="5" ry="3" fill="#0f172a" />
      </g>
      <g className="companion-leg companion-leg-back">
        <rect x="26" y="46" width="6" height="14" rx="3" fill="#334155" />
        <ellipse cx="29" cy="60" rx="5" ry="3" fill="#0f172a" />
      </g>
      <rect x="13" y="26" width="23" height="23" rx="8" fill="#f97316" />
      <rect x="9" y="29" width="6" height="15" rx="3" fill="#f6c9a0" />
      <rect x="34" y="29" width="6" height="15" rx="3" fill="#f6c9a0" />
      <circle cx="24" cy="15" r="12" fill="#f6c9a0" />
      <path d="M12 14a12 12 0 0 1 24 0c-5-4-13-5-16-2-3 1-6 1-8 2z" fill="#1e293b" />
      <circle cx="20" cy="16" r="1.5" fill="#0f172a" />
      <circle cx="29" cy="16" r="1.5" fill="#0f172a" />
      <path d="M21 21q3 2.5 6 0" stroke="#0f172a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
