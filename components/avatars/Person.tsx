interface Props {
  strokeColor: string;
  size: number;
  isMoving?: boolean;
}

export default function Person({ strokeColor, size, isMoving }: Props) {
  return (
    <svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 40 64"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={isMoving ? "person-walking" : ""}
    >
      {/* Hat brim */}
      <ellipse cx="20" cy="11" rx="13.5" ry="3.5" fill="#3A6828" stroke="#244416" strokeWidth="1" />
      {/* Hat top */}
      <rect x="12" y="2" width="16" height="11" rx="5" fill="#4A8434" stroke="#244416" strokeWidth="1" />
      {/* Hat highlight */}
      <rect x="14" y="4" width="10" height="4" rx="2.5" fill="rgba(255,255,255,0.15)" stroke="none" />

      {/* Head */}
      <ellipse cx="20" cy="20" rx="8.5" ry="8" fill="#FDDBB4" stroke="#C8854A" strokeWidth="1" />
      {/* Eyes */}
      <ellipse cx="16.5" cy="20" rx="1.5" ry="1.8" fill="#1A0A04" />
      <ellipse cx="23.5" cy="20" rx="1.5" ry="1.8" fill="#1A0A04" />
      {/* Mouth */}
      <path d="M17.5 24 Q20 25.8 22.5 24" stroke="#B87040" strokeWidth="1" fill="none" />

      {/* Shirt */}
      <path d="M11 30 Q10.5 32 10.5 42 L29.5 42 Q29.5 32 29 30 Q25 27 20 27 Q15 27 11 30Z"
        fill={strokeColor} stroke="rgba(0,0,0,0.20)" strokeWidth="0.8" />

      {/* Overalls bib */}
      <rect x="15.5" y="28.5" width="9" height="9.5" rx="1.5" fill="#2E52A0" stroke="#1C3878" strokeWidth="0.8" />
      {/* Bib clasp */}
      <rect x="18.5" y="29" width="3" height="2" rx="0.5" fill="#6888CC" stroke="none" />
      {/* Suspenders */}
      <line x1="15.5" y1="28.5" x2="13" y2="27" stroke="#2E52A0" strokeWidth="2.2" />
      <line x1="24.5" y1="28.5" x2="27" y2="27" stroke="#2E52A0" strokeWidth="2.2" />

      {/* Overalls legs */}
      <path d="M10.5 42 L11 57 L19 57 L20 50 L21 57 L29 57 L29.5 42Z"
        fill="#2E52A0" stroke="#1C3878" strokeWidth="0.8" />

      {/* Left arm — pivot at shoulder (11,31) */}
      <g transform="translate(11,31)">
        <g className="person-arm-l">
          <rect x="-4" y="0" width="7" height="13" rx="3.5" fill="#FDDBB4" stroke="#C8854A" strokeWidth="0.8" />
        </g>
      </g>
      {/* Right arm — pivot at shoulder (29,31) */}
      <g transform="translate(29,31)">
        <g className="person-arm-r">
          <rect x="-3" y="0" width="7" height="13" rx="3.5" fill="#FDDBB4" stroke="#C8854A" strokeWidth="0.8" />
        </g>
      </g>

      {/* Left boot — pivot at hip (15,56) */}
      <g transform="translate(15,56)">
        <g className="person-leg-l">
          <rect x="-5.5" y="0" width="11" height="7" rx="2.5" fill="#5C3318" stroke="#3A1E0A" strokeWidth="0.8" />
          <ellipse cx="0" cy="7" rx="6.5" ry="2.5" fill="#3E2008" stroke="none" />
        </g>
      </g>
      {/* Right boot — pivot at hip (25,56) */}
      <g transform="translate(25,56)">
        <g className="person-leg-r">
          <rect x="-5.5" y="0" width="11" height="7" rx="2.5" fill="#5C3318" stroke="#3A1E0A" strokeWidth="0.8" />
          <ellipse cx="0" cy="7" rx="6.5" ry="2.5" fill="#3E2008" stroke="none" />
        </g>
      </g>
    </svg>
  );
}
