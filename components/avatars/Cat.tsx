interface Props {
  strokeColor: string;
  size: number;
}

export default function Cat({ strokeColor, size }: Props) {
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
      {/* Ears */}
      <path d="M11 18 L9 8 L17 15" />
      <path d="M29 18 L31 8 L23 15" />
      {/* Head */}
      <circle cx="20" cy="19" r="9" />
      {/* Eyes */}
      <ellipse cx="16.5" cy="17.5" rx="2" ry="2.5" />
      <ellipse cx="23.5" cy="17.5" rx="2" ry="2.5" />
      <ellipse cx="16.5" cy="18" rx="0.8" ry="1.5" fill={strokeColor} stroke="none" />
      <ellipse cx="23.5" cy="18" rx="0.8" ry="1.5" fill={strokeColor} stroke="none" />
      {/* Nose */}
      <path d="M19 22 L20 21 L21 22 L20 23 Z" fill={strokeColor} stroke="none" />
      {/* Mouth */}
      <path d="M20 23 Q17.5 25 16 24" />
      <path d="M20 23 Q22.5 25 24 24" />
      {/* Whiskers */}
      <path d="M11 20 L16 21" />
      <path d="M29 20 L24 21" />
      <path d="M11 22 L16 22.5" />
      <path d="M29 22 L24 22.5" />
      {/* Body */}
      <ellipse cx="20" cy="38" rx="11" ry="11" />
      {/* Tail */}
      <path d="M31 42 Q40 37 38 29 Q36 22 40 17" />
    </svg>
  );
}
