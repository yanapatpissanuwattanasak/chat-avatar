interface Props {
  strokeColor: string;
  size: number;
}

export default function Bean({ strokeColor, size }: Props) {
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
      {/* Head — small and high */}
      <circle cx="20" cy="8" r="6" />
      {/* Elongated bean body */}
      <path d="M13 18 Q9 30 10 42 Q14 53 20 53 Q26 53 30 42 Q31 30 27 18 Q24 14 20 14 Q16 14 13 18Z" />
      {/* Arms spread wide — waving energy */}
      <path d="M13 27 Q7 23 2 27" />
      <path d="M27 27 Q33 23 38 27" />
    </svg>
  );
}
