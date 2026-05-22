interface Props {
  strokeColor: string;
  size: number;
}

export default function Bunny({ strokeColor, size }: Props) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 40 56"
      fill="none"
      stroke={strokeColor}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Long ears */}
      <ellipse cx="15" cy="10" rx="4" ry="10" />
      <ellipse cx="25" cy="10" rx="4" ry="10" />
      {/* Inner ear hint */}
      <path d="M15 3 Q15 16 15 18" strokeOpacity="0.45" />
      <path d="M25 3 Q25 16 25 18" strokeOpacity="0.45" />
      {/* Head */}
      <circle cx="20" cy="25" r="10" />
      {/* Eyes */}
      <circle cx="16" cy="23" r="2" fill={strokeColor} stroke="none" />
      <circle cx="24" cy="23" r="2" fill={strokeColor} stroke="none" />
      {/* Nose */}
      <circle cx="20" cy="27" r="1.2" fill={strokeColor} stroke="none" />
      {/* Mouth */}
      <path d="M17.5 29 Q20 31 22.5 29" />
      {/* Body */}
      <ellipse cx="20" cy="44" rx="12" ry="11" />
      {/* Tail */}
      <circle cx="32" cy="49" r="3.5" />
    </svg>
  );
}
