interface Props {
  strokeColor: string;
  size: number;
}

export default function Blob({ strokeColor, size }: Props) {
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
      {/* Head */}
      <circle cx="20" cy="12" r="8" />
      {/* Body */}
      <ellipse cx="20" cy="33" rx="12" ry="14" />
      {/* Left arm */}
      <path d="M8 28 Q3 31 5 37" />
      {/* Right arm */}
      <path d="M32 28 Q37 31 35 37" />
    </svg>
  );
}
