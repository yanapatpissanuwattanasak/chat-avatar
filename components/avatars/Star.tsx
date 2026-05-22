interface Props {
  strokeColor: string;
  size: number;
}

// 5-pointed star centered at (22, 37), outer r=13, inner r=5.5
const STAR_POINTS =
  "22,24 25,31 35,31 28,37 30,47 22,42 14,47 16,37 9,31 19,31";

export default function Star({ strokeColor, size }: Props) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 44 56"
      fill="none"
      stroke={strokeColor}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Head */}
      <circle cx="22" cy="9" r="7" />
      {/* Star body */}
      <polygon points={STAR_POINTS} />
    </svg>
  );
}
