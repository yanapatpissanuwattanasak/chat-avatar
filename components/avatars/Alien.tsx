interface Props {
  strokeColor: string;
  size: number;
}

export default function Alien({ strokeColor, size }: Props) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 40 52"
      fill="none"
      stroke={strokeColor}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Antenna nubs */}
      <circle cx="14" cy="5" r="2" fill={strokeColor} stroke="none" />
      <circle cx="26" cy="5" r="2" fill={strokeColor} stroke="none" />
      {/* Head — tall oval */}
      <ellipse cx="20" cy="16" rx="13" ry="13" />
      {/* Big almond eyes */}
      <ellipse cx="15" cy="15" rx="5" ry="4" />
      <ellipse cx="25" cy="15" rx="5" ry="4" />
      <circle cx="15.5" cy="15.5" r="2.5" fill={strokeColor} stroke="none" />
      <circle cx="25.5" cy="15.5" r="2.5" fill={strokeColor} stroke="none" />
      {/* Small mouth */}
      <path d="M17 23.5 Q20 26 23 23.5" />
      {/* Narrow neck */}
      <line x1="18" y1="29" x2="18" y2="32" />
      <line x1="22" y1="29" x2="22" y2="32" />
      {/* Slim body */}
      <ellipse cx="20" cy="41" rx="10" ry="10" />
      {/* Long arms */}
      <path d="M10 35 Q4 41 6 47" />
      <path d="M30 35 Q36 41 34 47" />
    </svg>
  );
}
